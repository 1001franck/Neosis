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
 * Configuration ICE : STUN + TURN pour le NAT traversal
 *
 * STUN : découvre l'IP publique (NAT cone). Insuffisant pour NAT symétrique (4G/5G, certains FAI).
 * TURN : relai en cas d'échec P2P direct — indispensable pour des réseaux différents en production.
 *
 *   Les serveurs TURN publics gratuits (openrelay, etc.) sont fréquemment hors-ligne ou saturés.
 *     Chrome avertit "ICE failed, your TURN server appears to be broken" quand ils ne répondent pas.
 *     Pour une fiabilité de production, configurer un vrai service TURN via les variables d'env :
 *       NEXT_PUBLIC_TURN_URL      ex: turn:my-turn.example.com:443?transport=tcp
 *       NEXT_PUBLIC_TURN_USERNAME ex: nom-utilisateur-généré
 *       NEXT_PUBLIC_TURN_CREDENTIAL ex: credential-généré
 *     Twilio Network Traversal, Metered.ca (payant) ou coturn self-hosted sont les options viables.
 *
 * Chrome déconseille 5+ serveurs ICE (ralentit la découverte) — on reste à 2 STUN maximum.
 */
function buildIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  const turnUrl        = process.env.NEXT_PUBLIC_TURN_URL;
  const turnUsername   = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;

  if (turnUrl && turnUsername && turnCredential) {
    servers.push({ urls: turnUrl, username: turnUsername, credential: turnCredential });
  }
  // Pas de TURN configuré → STUN only. Connexions sur le même réseau ou NAT ouvert fonctionneront ;
  // NAT symétrique (4G/5G, certains FAI) sera en échec — c'est le comportement attendu sans TURN.

  return servers;
}

const ICE_SERVERS: RTCIceServer[] = buildIceServers();

/**
 * Interface pour gérer une connexion peer-to-peer avec un autre utilisateur
 */
interface PeerConnection {
  userId: string;                  // ID de l'utilisateur distant
  connection: RTCPeerConnection;   // Connexion WebRTC
  isInitiator: boolean;            // true = on a initié (impolite peer dans perfect negotiation)
  negotiationComplete: boolean;    // true après le premier échange offer/answer
  makingOffer: boolean;            // true pendant la création d'une offre (guard re-entrée)
  // Compte le nombre de fois que onnegotiationneeded a été déclenché.
  // Le premier déclenchement (valeur 0→1) est toujours causé par addTrack() dans
  // createPeerConnection() ; pour le non-initiateur ce n'est pas une vraie demande
  // de renégociation — on l'absorbe sans envoyer d'offre.
  negotiationNeededCount: number;
  // File d'attente des candidats ICE reçus avant setRemoteDescription.
  // Drainée juste après l'application de la description distante.
  iceCandidateQueue: RTCIceCandidate[];
  // true entre setRemoteDescription et la fin du drain de la queue
  remoteDescriptionSet: boolean;
  stream?: MediaStream;            // Stream audio reçu
  audioElement?: HTMLAudioElement; // Élément audio
  videoStream?: MediaStream;       // Stream vidéo distant (caméra ou écran selon exclusion mutuelle)
  screenStream?: MediaStream;      // Réservé pour usage futur
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
          const audioElement = document.createElement('audio');
          // Attacher au DOM pour éviter le GC et contourner l'autoplay Tauri/WebView2
          audioElement.style.display = 'none';
          audioElement.id = `voice-audio-${userId}`;
          document.body.appendChild(audioElement);
          audioElement.srcObject = remoteStream;
          audioElement.autoplay = true;
          audioElement.muted = this.isDeafened;
          peer.audioElement = audioElement;
          peer.stream = remoteStream;
          // Forcer la lecture — autoplay seul peut être bloqué par le navigateur
          audioElement.play().catch(err => {
            logger.warn('Audio autoplay bloqué, interaction utilisateur requise', { userId, err });
            // Notifier l'UI pour proposer un bouton de déblocage
            window.dispatchEvent(new CustomEvent('voice:audio-autoplay-blocked'));
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
     * Negotiation Needed — Pattern "perfect negotiation"
     *
     * Déclenché par addTrack() ou removeTrack(). Ce handler gère à la fois
     * la négociation initiale (initiateur uniquement) et les renégociations
     * (ajout caméra, partage d'écran en cours d'appel).
     *
     * Guard makingOffer : empêche deux offres concurrentes si l'événement
     * se déclenche pendant qu'on attend déjà la réponse à un createOffer().
     *
     * Guard negotiationNeededCount : le premier déclenchement sur le non-initiateur
     * est toujours le bruit causé par addTrack() dans createPeerConnection().
     * Ce déclenchement résiduel peut arriver APRÈS que negotiationComplete soit déjà
     * true (si l'offre distante a été traitée avant que la macrotask ne s'exécute).
     * On l'absorbe : le non-initiateur n'envoie jamais l'offre initiale.
     */
    peerConnection.onnegotiationneeded = async () => {
      const peer = this.peers.get(userId);
      if (!peer) return;

      peer.negotiationNeededCount += 1;

      // Le non-initiateur ignore son premier déclenchement (bruit de addTrack initial).
      // Les suivants (renégociation caméra, écran) sont légitimes.
      if (!peer.isInitiator && peer.negotiationNeededCount === 1) return;

      // Éviter la re-entrée : si on est déjà en train de créer une offre, on abandonne
      if (peer.makingOffer) return;

      // Si la connexion n'est pas stable, l'événement sera re-déclenché plus tard
      if (peerConnection.signalingState !== 'stable') return;

      try {
        peer.makingOffer = true;
        const offer = await peerConnection.createOffer();

        // Vérifier que l'état n'a pas changé pendant l'await createOffer()
        // (un signal entrant peut avoir modifié l'état entre-temps)
        if (peerConnection.signalingState !== 'stable') return;

        await peerConnection.setLocalDescription(offer);
        socketEmitters.sendWebRTCSignal(userId, { type: 'offer', sdp: offer });
        logger.debug('Offer sent', { userId, renegotiation: peer.negotiationComplete });
      } catch (err) {
        logger.error('Offer creation failed', { userId, err });
      } finally {
        peer.makingOffer = false;
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

    // Stocker la connexion — onnegotiationneeded (déclenché par addTrack ci-dessus)
    // sera traité par l'event loop juste après ; le flag isInitiator détermine qui envoie l'offre
    this.peers.set(userId, {
      userId,
      connection: peerConnection,
      isInitiator: initiator,
      negotiationComplete: false,
      makingOffer: false,
      negotiationNeededCount: 0,
      iceCandidateQueue: [],
      remoteDescriptionSet: false,
    });

    // L'offre initiale est envoyée par onnegotiationneeded dès qu'il se déclenche.
    // On ne crée PAS d'offre manuellement ici pour éviter la double offre.
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

      // === OFFER reçue ===
      if (signal.type === 'offer') {
        // Créer la connexion si elle n'existe pas (pair qui nous contacte en premier)
        if (!peer) {
          await this.createPeerConnection(fromUserId, false);
        }

        const currentPeer = this.peers.get(fromUserId);
        const peerConnection = currentPeer?.connection;
        if (!peerConnection || !currentPeer) return;

        // Perfect negotiation — détection de collision d'offres
        const offerCollision = currentPeer.makingOffer || peerConnection.signalingState !== 'stable';

        if (offerCollision) {
          if (currentPeer.isInitiator) {
            // Impolite peer : on ignore l'offre entrante — on a priorité
            logger.debug('Offer collision: ignoring incoming offer (we are initiator)', { fromUserId });
            return;
          }
          // Polite peer : on rollback notre offre en cours et on accepte celle du pair
          logger.debug('Offer collision: rolling back to accept incoming offer', { fromUserId });
          await peerConnection.setLocalDescription({ type: 'rollback' });
          currentPeer.makingOffer = false;
        }

        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        currentPeer.remoteDescriptionSet = true;

        // Drainer les candidats ICE mis en attente avant setRemoteDescription
        await this.drainIceCandidateQueue(fromUserId);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        logger.debug('Sending answer to peer', { fromUserId });
        socketEmitters.sendWebRTCSignal(fromUserId, { type: 'answer', sdp: answer });

        // Premier échange terminé — renégociations autorisées désormais
        currentPeer.negotiationComplete = true;
      }

      // === ANSWER reçue ===
      else if (signal.type === 'answer' && peer) {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        peer.remoteDescriptionSet = true;
        // Premier échange terminé — renégociations autorisées désormais
        peer.negotiationComplete = true;

        // Drainer les candidats ICE mis en attente avant setRemoteDescription
        await this.drainIceCandidateQueue(fromUserId);

        logger.info('Answer received and applied', { fromUserId });
      }

      // === ICE CANDIDATE reçu ===
      else if (signal.type === 'ice-candidate') {
        const candidate = new RTCIceCandidate(signal.candidate);

        if (!peer || !peer.remoteDescriptionSet) {
          // Pas encore de peer ou setRemoteDescription pas encore appelé :
          // on met en file d'attente pour appliquer après.
          const targetPeer = peer ?? this.peers.get(fromUserId);
          if (targetPeer) {
            targetPeer.iceCandidateQueue.push(candidate);
            logger.debug('ICE candidate queued (waiting for remote description)', { fromUserId });
          } else {
            logger.warn('ICE candidate dropped: peer unknown', { fromUserId });
          }
        } else {
          await this.applyIceCandidate(peer, candidate, fromUserId);
        }
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
   * Applique un candidat ICE en gérant les erreurs non fatales.
   * addIceCandidate peut lever si appelé dans un mauvais état de signaling.
   */
  private async applyIceCandidate(peer: PeerConnection, candidate: RTCIceCandidate, userId: string): Promise<void> {
    try {
      await peer.connection.addIceCandidate(candidate);
      logger.debug('ICE candidate added', { userId });
    } catch (err) {
      logger.warn('ICE candidate ignored (non-fatal)', { userId, err });
    }
  }

  /**
   * Draine la file d'attente des candidats ICE accumulés avant setRemoteDescription.
   * À appeler immédiatement après avoir appliqué la description distante.
   */
  private async drainIceCandidateQueue(userId: string): Promise<void> {
    const peer = this.peers.get(userId);
    if (!peer || peer.iceCandidateQueue.length === 0) return;

    logger.debug('Draining ICE candidate queue', { userId, count: peer.iceCandidateQueue.length });
    const queued = peer.iceCandidateQueue.splice(0);
    for (const candidate of queued) {
      await this.applyIceCandidate(peer, candidate, userId);
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
      // Stopper et libérer l'élément audio + retirer du DOM
      if (peer.audioElement) {
        peer.audioElement.pause();
        peer.audioElement.srcObject = null;
        peer.audioElement.remove();
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
   * Débloquer tous les éléments audio après interaction utilisateur
   * (contourne la politique autoplay des navigateurs)
   */
  unlockAudio(): void {
    this.peers.forEach((peer) => {
      if (peer.audioElement && peer.audioElement.paused) {
        peer.audioElement.play().catch(() => {
          // Silencieux — l'utilisateur vient d'interagir, ça doit passer
        });
      }
    });
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
      // Stopper l'élément audio + retirer du DOM
      if (peer.audioElement) {
        peer.audioElement.pause();
        peer.audioElement.srcObject = null;
        peer.audioElement.remove();
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
