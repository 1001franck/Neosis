/**
 * PRESENTATION COMPONENTS INDEX
 * Exporte tous les composants réutilisables
 *
 * Responsabilités:
 * - Centraliser les exports de tous les composants
 * - Fournir un point d'accès unique
 * - Faciliter l'importation dans les pages
 */

// === ERROR & FEEDBACK ===
export { ErrorBoundary } from './components/error/ErrorBoundary';
export { useToast, ToastProvider } from './components/toast/ToastProvider';
export { Toast } from './components/toast/Toast';

// === LAYOUT COMPONENTS ===
export { Header } from './components/layout/Header';
export { Sidebar } from './components/layout/Sidebar';
export { Footer } from './components/layout/Footer';
export { ServerSidebar } from './components/layout/ServerSidebar';
export { DirectMessagesPanel } from './components/layout/DirectMessagesPanel';
export { MainLayout } from './components/layout/MainLayout';

// === COMMON COMPONENTS ===
export { Button } from './components/common/Button';
export { Card } from './components/common/Card';
export { Modal } from './components/common/Modal';
export { Loading } from './components/common/Loading';
export { Alert } from './components/common/Alert';
export { Input } from './components/common/Input';
export { Form } from './components/common/Form';
export { Avatar } from './components/common/Avatar';
export { Badge } from './components/common/Badge';

// === AUTH COMPONENTS ===
export { ProtectedRoute } from './components/auth/ProtectedRoute';
export { PublicRoute } from './components/auth/PublicRoute';

// === MESSAGE COMPONENTS ===
export { EmptyState } from './components/messages/EmptyState';

// === CHAT COMPONENTS ===
export { ChatArea } from './components/chat/ChatArea';

// === CHANNEL COMPONENTS ===
export { ChannelItem, ServerChannelsSidebar, ChannelInfoSidebar } from './components/channels';

// === MEMBER COMPONENTS ===
export { MembersSidebar } from './components/members';

// === MEDIA COMPONENTS ===
export { MediaLightbox } from './components/media';
