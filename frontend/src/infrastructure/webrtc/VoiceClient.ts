/**
 * INFRASTRUCTURE - WEBRTC VOICE CLIENT
 * Gère la communication audio en temps réel via WebRTC
 *
 * 🎙️ COMMENT ÇA MARCHE :
 *
 * 1. **getUserMedia()** : Demande accès au micro
 * 2. **RTCPeerConnection** : Connexion peer-to-peer avec un autre utilisateur
 * 3. **Socket.IO signaling** : Coordonne qui se connecte avec qui (échange des "signaux")
 * 4. **Audio Streaming** : Transmission audio directe entre navigateurs (pas via serveur)
 *
 * WebRTC = Web Real-Time Communication (API JavaScript native du navigateur)
 */

import { socketEmitters } from '@infrastructure/websocket/emitters';
import { socket } from '@infrastructure/websocket/socket';
import { logger } from '@shared/utils/logger';
import { useVoiceStore } from '@application/voice/voiceStore';

/**
 * Configuration STUN pour le NAT traversal
 * STUN = Session Traversal Utilities for NAT
 * Permet de découvrir votre adresse IP publique pour les connexions P2P
 */
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },      // Serveur STUN gratuit de Google
  { urls: 'stun:stun1.l.google.com:19302' },
];

/**
 * Interface pour gérer une connexion peer-to-peer avec un autre utilisateur
 */
interface PeerConnection {
  userId: string;                  // ID de l'utilisateur distant
  connection: RTCPeerConnection;   // Connexion WebRTC
  isInitiator: boolean;            // Vrai si on a initié la connexion
  negotiationComplete: boolean;    // Vrai après le premier échange offer/answer
  stream?: MediaStream;            // Stream audio reçu
  audioElement?: HTMLAudioElement; // Élément audio
  videoStream?: MediaStream;       // Stream caméra distant
  screenStream?: MediaStream;      // Stream partage d'écran distant
  audioContext?: AudioContext;     // Analyse audio pour "speaker"
  analyser?: AnalyserNode;
  dataArray?: Uint8Array;
  rafId?: number;
  isSpeaking?: boolean;
}

/**
 * VoiceClient
 *
 * Responsabilités :
 * - Gérer l'accès au micro local
 * - Créer des connexions WebRTC avec les autres utilisateurs
 * - Transmettre l'audio en temps réel
 * - Gérer mute/unmute
 */
export class VoiceClient {
  private localStream: MediaStream | null = null;       // Mon stream audio (micro)
  private localVideoStream: MediaStream | null = null;  // Mon stream vidéo (caméra)
  private localScreenStream: MediaStream | null = null; // Mon stream partage d'écran
  private peers: Map<string, PeerConnection> = new Map();
  private isMuted: boolean = false;
  private isDeafened: boolean = false;

  // Callback déclenché quand le partage d'écran est arrêté via l'UI du navigateur
  private onScreenShareEnded: (() => void) | null = null;

  constructor() {
    this.setupSignalingListener();
  }

  /**
   * ÉTAPE 1 : Initialiser l'audio (demander accès au micro)
   *
   * Cette fonction demande la permission d'accéder au micro
   * via l'API navigator.mediaDevices.getUserMedia()
   */
  async initializeAudio(): Promise<void> {
    try {
      logger.info('🎤 Requesting microphone access...');

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia indisponible dans ce navigateur');
      }

      // Reuse stream if already active
      if (this.localStream && this.localStream.getAudioTracks().some(t => t.readyState === 'live')) {
        logger.info('🎤 Microphone stream already active');
        return;
      }

      // Demander accès au micro (le navigateur affiche une popup de permission)
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,    // Suppression d'écho
            noiseSuppression: true,    // Suppression du bruit de fond
            autoGainControl: true,     // Ajustement automatique du volume
          },
          video: false  // Pas de vidéo, juste l'audio
        });
      } catch (_err) {
        // Fallback: contraintes simples si le navigateur refuse les avancées
        logger.warn('Retrying microphone access with basic constraints');
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
      }

      logger.info(' Microphone access granted', {
        tracks: this.localStream.getAudioTracks().length
      });
    } catch (error) {
      const err = error as DOMException & { name?: string; message?: string };
      logger.error(' Failed to access microphone', {
        name: err?.name,
        message: err?.message,
        stack: (err as Error)?.stack,
      });
      const name = err?.name;
      let message = 'Impossible d\'accéder au microphone. Vérifiez les permissions.';
      if (name === 'NotAllowedError') {
        message = 'Accès micro refusé. Autorisez le micro dans le navigateur.';
      } else if (name === 'NotFoundError') {
        message = 'Aucun micro détecté.';
      } else if (name === 'NotReadableError') {
        message = 'Micro déjà utilisé par une autre application.';
      } else if (name === 'OverconstrainedError') {
        message = 'Contraintes audio incompatibles avec votre micro.';
      } else if (name === 'SecurityError') {
        message = 'Accès micro bloqué par le contexte sécurisé.';
      }
      throw new Error(message);
    }
  }

  /**
   * ÉTAPE 2 : Créer une connexion peer-to-peer avec un autre utilisateur
   *
   * @param userId - ID de l'utilisateur distant
   * @param initiator - true si c'est nous qui initialisons la connexion
   */
  async createPeerConnection(userId: string, initiator: boolean): Promise<void> {
    // Ne pas créer de connexion si elle existe déjà
    if (this.peers.has(userId)) {
      logger.warn('Peer connection already exists', { userId });
      return;
    }

    logger.info(`🔗 Creating peer connection with user ${userId}`, { initiator });

    // Créer la connexion WebRTC
    const peerConnection = new RTCPeerConnection({
      iceServers: ICE_SERVERS
    });

    if (this.localStream && this.localStream.getTracks().length > 0) {
      // Ajouter notre audio local à la connexion (pour que l'autre nous entende)
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
        logger.debug('Added local track to peer connection', { userId, track: track.kind });
      });
    } else {
      // Mode écoute seule : on reçoit l'audio sans envoyer de micro
      try {
        peerConnection.addTransceiver('audio', { direction: 'recvonly' });
        logger.info('Listening-only peer connection created', { userId });
      } catch (_err) {
        logger.warn('Failed to add recvonly transceiver', { userId });
      }
    }

    // === ÉVÉNEMENTS WEBRTC ===

    /**
     * ICE Candidate : Information sur comment nous joindre
     * Dès qu'on découvre une nouvelle façon de se connecter (ICE candidate),
     * on l'envoie à l'autre utilisateur via Socket.IO
     */
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        logger.debug('Sending ICE candidate to peer', { userId });
        socketEmitters.sendWebRTCSignal(userId, {
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    /**
     * Track : On reçoit un track audio ou vidéo de l'autre utilisateur
     */
    peerConnection.ontrack = (event) => {
      // Utiliser event.streams[0] si disponible, sinon créer un stream depuis le track directement
      const remoteStream = event.streams[0] ?? new MediaStream([event.track]);
      const peer = this.peers.get(userId);
      if (!peer) return;

      if (event.track.kind === 'audio') {
        logger.info('🔊 Received remote audio track', { userId });

        // Un seul élément audio par peer
        if (!peer.audioElement) {
          const audioElement = new Audio();
          audioElement.srcObject = remoteStream;
          audioElement.autoplay = true;
          audioElement.muted = this.isDeafened;
          peer.audioElement = audioElement;
          peer.stream = remoteStream;
          // Forcer la lecture — autoplay seul peut être bloqué par le navigateur
          audioElement.play().catch(err => {
            logger.warn('Audio autoplay bloqué, interaction utilisateur requise', { userId, err });
          });
          this.startSpeakingMonitor(userId, remoteStream);
        }
      } else if (event.track.kind === 'video') {
        logger.info('📹 Received remote video track', { userId });
        // Premier track vidéo = caméra, second track vidéo = partage d'écran
        if (peer.videoStream) {
          peer.screenStream = remoteStream;
        } else {
          peer.videoStream = remoteStream;
        }

        // Notifier les composants React qu'un stream vidéo est disponible
        window.dispatchEvent(new CustomEvent('voice:video-stream-updated', { detail: { userId } }));

        // Nettoyer quand le track se termine
        event.track.onended = () => {
          if (peer.screenStream === remoteStream) {
            peer.screenStream = undefined;
          } else {
            // Promouvoir screenStream en videoStream si caméra se coupe
            peer.videoStream = peer.screenStream;
            peer.screenStream = undefined;
          }
          window.dispatchEvent(new CustomEvent('voice:video-stream-updated', { detail: { userId } }));
        };
      }
    };

    /**
     * Negotiation Needed : renégocier quand un track est ajouté/retiré après l'établissement
     * (ex: ajout de la caméra en cours d'appel)
     *
     * Supprimé pour le non-initiateur tant que le premier échange offer/answer n'est pas terminé,
     * pour éviter le glare (les deux côtés envoient une offre simultanément).
     */
    peerConnection.onnegotiationneeded = async () => {
      if (peerConnection.signalingState !== 'stable') return;

      const peer = this.peers.get(userId);
      if (!peer) return;

      // Le non-initiateur attend l'offre de l'autre côté pour la connexion initiale
      if (!peer.isInitiator && !peer.negotiationComplete) return;

      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socketEmitters.sendWebRTCSignal(userId, { type: 'offer', sdp: offer });
        logger.debug('Renegotiation offer sent', { userId });
      } catch (err) {
        logger.error('Renegotiation failed', { userId, err });
      }
    };

    /**
     * Connection State Change : Surveiller l'état de la connexion
     */
    peerConnection.onconnectionstatechange = () => {
      logger.info('Peer connection state changed', {
        userId,
        state: peerConnection.connectionState
      });

      // Si la connexion échoue ou se ferme, nettoyer
      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'closed') {
        this.removePeer(userId);
      }
    };

    // Stocker la connexion
    this.peers.set(userId, { userId, connection: peerConnection, isInitiator: initiator, negotiationComplete: false });

    // === SIGNALING : Échange de configuration ===

    if (initiator) {
      // Si on est l'initiateur, on crée une "offer" (proposition de connexion)
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Envoyer l'offer à l'autre utilisateur via Socket.IO
      logger.debug('Sending offer to peer', { userId });
      socketEmitters.sendWebRTCSignal(userId, {
        type: 'offer',
        sdp: offer
      });
    }
  }

  /**
   * ÉTAPE 3 : Gérer les signaux WebRTC reçus d'autres utilisateurs
   *
   * Les "signaux" sont des messages JSON échangés via Socket.IO pour
   * établir la connexion WebRTC. Il y a 3 types :
   * - offer : Proposition de connexion
   * - answer : Réponse à une proposition
   * - ice-candidate : Information de connectivité
   */
  private setupSignalingListener(): void {
     
    socket.on('voice:webrtc_signal', async ({ fromUserId, signal }: {
      fromUserId: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- signal WebRTC opaque, format imposé par la spec WebRTC
      signal: any;
    }) => {
      logger.debug('Received WebRTC signal', { fromUserId, type: signal.type });

      const peer = this.peers.get(fromUserId);

      // Si on reçoit une offer, on doit répondre
      if (signal.type === 'offer') {
        // Créer la connexion si elle n'existe pas
        if (!peer) {
          await this.createPeerConnection(fromUserId, false);
        }

        const peerConnection = this.peers.get(fromUserId)?.connection;
        if (!peerConnection) return;

        // Accepter l'offer
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));

        // Créer une answer (réponse)
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        // Envoyer l'answer
        logger.debug('Sending answer to peer', { fromUserId });
        socketEmitters.sendWebRTCSignal(fromUserId, {
          type: 'answer',
          sdp: answer
        });

        // Premier échange terminé — les renegociations sont désormais permises
        const answeredPeer = this.peers.get(fromUserId);
        if (answeredPeer) answeredPeer.negotiationComplete = true;
      }

      // Si on reçoit une answer, on l'applique
      else if (signal.type === 'answer' && peer) {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        // Premier échange terminé — les renegociations (caméra, écran) sont désormais permises
        peer.negotiationComplete = true;
        logger.info('Answer received and applied', { fromUserId });
      }

      // Si on reçoit un ICE candidate, on l'ajoute
      else if (signal.type === 'ice-candidate' && peer) {
        await peer.connection.addIceCandidate(new RTCIceCandidate(signal.candidate));
        logger.debug('ICE candidate added', { fromUserId });
      }
    });
  }

  /**
   * Mute/Unmute le micro
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;

    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;  // Désactiver/activer le track
      });

      logger.info(`🎤 Microphone ${muted ? 'muted' : 'unmuted'}`);
    }
  }

  /**
   * Deafen/Undeafen (couper/activer le son)
   */
  setDeafened(deafened: boolean): void {
    this.isDeafened = deafened;

    // Si deafen, mute aussi le micro
    if (deafened) {
      this.setMuted(true);
    }

    // Mute/unmute tous les éléments <audio> des peers
    this.peers.forEach((peer) => {
      if (peer.audioElement) {
        peer.audioElement.muted = deafened;
      }
    });

    logger.info(`🔇 Audio ${deafened ? 'deafened' : 'undeafened'}`);
  }

  /**
   * Détecter si un utilisateur parle (analyse audio locale)
   */
  private startSpeakingMonitor(userId: string, stream: MediaStream): void {
    const peer = this.peers.get(userId);
    if (!peer) return;

    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      source.connect(analyser);

      peer.audioContext = audioContext;
      peer.analyser = analyser;
      peer.dataArray = dataArray;

      const tick = () => {
        if (!peer.analyser || !peer.dataArray) return;
        peer.analyser.getByteFrequencyData(peer.dataArray as unknown as Uint8Array<ArrayBuffer>);
        const sum = peer.dataArray.reduce((acc, v) => acc + v, 0);
        const avg = sum / peer.dataArray.length;
        const speaking = avg > 18;

        if (peer.isSpeaking !== speaking) {
          peer.isSpeaking = speaking;
          const store = useVoiceStore.getState() as {
            connectedChannelId: string | null;
            setUserSpeaking?: (channelId: string, userId: string, isSpeaking: boolean) => void;
          };
          if (store.connectedChannelId && store.setUserSpeaking) {
            store.setUserSpeaking(store.connectedChannelId, userId, speaking);
          }
        }

        peer.rafId = requestAnimationFrame(tick);
      };

      peer.rafId = requestAnimationFrame(tick);
    } catch (error) {
      logger.warn('Failed to start speaking monitor', { userId, error });
    }
  }

  /**
   * Fermer une connexion peer
   */
  private removePeer(userId: string): void {
    const peer = this.peers.get(userId);
    if (peer) {
      if (peer.rafId) {
        cancelAnimationFrame(peer.rafId);
      }
      if (peer.audioContext) {
        peer.audioContext.close();
      }
      // Stopper et libérer l'élément audio
      if (peer.audioElement) {
        peer.audioElement.pause();
        peer.audioElement.srcObject = null;
      }
      peer.connection.close();
      this.peers.delete(userId);
      logger.info('Peer connection closed', { userId });
    }
  }

  /**
   * Activer la caméra et envoyer le stream vidéo aux peers
   */
  async enableCamera(): Promise<void> {
    if (this.localVideoStream) return;

    this.localVideoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    const videoTrack = this.localVideoStream.getVideoTracks()[0];

    // Ajouter la track vidéo à toutes les connexions existantes (déclenche onnegotiationneeded)
    this.peers.forEach((peer) => {
      peer.connection.addTrack(videoTrack, this.localVideoStream!);
    });

    logger.info('📹 Camera enabled');
  }

  /**
   * Désactiver la caméra
   */
  disableCamera(): void {
    if (!this.localVideoStream) return;

    const videoTrack = this.localVideoStream.getVideoTracks()[0];

    // Retirer la track de toutes les connexions (déclenche onnegotiationneeded)
    this.peers.forEach((peer) => {
      const sender = peer.connection.getSenders().find(s => s.track === videoTrack);
      if (sender) peer.connection.removeTrack(sender);
    });

    this.localVideoStream.getTracks().forEach(t => t.stop());
    this.localVideoStream = null;

    logger.info('📹 Camera disabled');
  }

  /**
   * Activer le partage d'écran
   */
  async enableScreenShare(): Promise<void> {
    if (this.localScreenStream) return;

    this.localScreenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const screenTrack = this.localScreenStream.getVideoTracks()[0];

    // Arrêt depuis l'UI du navigateur (bouton "Stop sharing")
    screenTrack.onended = () => {
      this.localScreenStream = null;
      if (this.onScreenShareEnded) this.onScreenShareEnded();
    };

    // Ajouter la track à toutes les connexions existantes
    this.peers.forEach((peer) => {
      peer.connection.addTrack(screenTrack, this.localScreenStream!);
    });

    logger.info('🖥️ Screen share enabled');
  }

  /**
   * Désactiver le partage d'écran
   */
  disableScreenShare(): void {
    if (!this.localScreenStream) return;

    const screenTrack = this.localScreenStream.getVideoTracks()[0];

    this.peers.forEach((peer) => {
      const sender = peer.connection.getSenders().find(s => s.track === screenTrack);
      if (sender) peer.connection.removeTrack(sender);
    });

    this.localScreenStream.getTracks().forEach(t => t.stop());
    this.localScreenStream = null;

    logger.info('🖥️ Screen share disabled');
  }

  /**
   * Enregistrer le callback appelé quand l'utilisateur arrête le screenshare via le navigateur
   */
  setOnScreenShareEnded(cb: () => void): void {
    this.onScreenShareEnded = cb;
  }

  /**
   * Accéder aux streams pour l'affichage vidéo
   */
  getLocalVideoStream(): MediaStream | null {
    return this.localVideoStream;
  }

  getLocalScreenStream(): MediaStream | null {
    return this.localScreenStream;
  }

  getRemoteVideoStream(userId: string): MediaStream | undefined {
    return this.peers.get(userId)?.videoStream;
  }

  getRemoteScreenStream(userId: string): MediaStream | undefined {
    return this.peers.get(userId)?.screenStream;
  }

  /**
   * Nettoyer toutes les connexions (quand on quitte le voice channel)
   */
  cleanup(): void {
    logger.info('🧹 Cleaning up voice client...');

    // Retirer le listener WebRTC pour éviter les connexions fantômes
    socket.off('voice:webrtc_signal');

    // Fermer toutes les connexions peer
    this.peers.forEach((peer) => {
      if (peer.rafId) {
        cancelAnimationFrame(peer.rafId);
      }
      if (peer.audioContext) {
        peer.audioContext.close();
      }
      // Stopper l'élément audio
      if (peer.audioElement) {
        peer.audioElement.pause();
        peer.audioElement.srcObject = null;
      }
      peer.connection.close();
    });
    this.peers.clear();

    // Arrêter le stream audio local (libérer le micro)
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Arrêter la caméra si active
    if (this.localVideoStream) {
      this.localVideoStream.getTracks().forEach(track => track.stop());
      this.localVideoStream = null;
    }

    // Arrêter le partage d'écran si actif
    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach(track => track.stop());
      this.localScreenStream = null;
    }

    logger.info(' Voice client cleaned up');
  }

  /**
   * Obtenir tous les user IDs connectés
   */
  getConnectedPeerIds(): string[] {
    return Array.from(this.peers.keys());
  }
}

/**
 * Singleton global — partagé entre tous les appels à useVoice()
 * Cela évite le problème où chaque composant a son propre voiceClientRef null
 */
let _voiceClientInstance: VoiceClient | null = null;

export function getVoiceClient(): VoiceClient {
  if (!_voiceClientInstance) {
    _voiceClientInstance = new VoiceClient();
  }
  return _voiceClientInstance;
}

export function destroyVoiceClient(): void {
  if (_voiceClientInstance) {
    _voiceClientInstance.cleanup();
    _voiceClientInstance = null;
  }
}
