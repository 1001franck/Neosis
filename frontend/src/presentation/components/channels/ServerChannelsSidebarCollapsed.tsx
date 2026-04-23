/**
 * SERVER CHANNELS SIDEBAR COLLAPSED COMPONENT
 * Sidebar en mode collapsed affichant uniquement les icônes des channels
 * 
 * Responsabilités:
 * - Afficher le header du serveur réduit
 * - Lister les channels en mode icône uniquement
 * - Afficher un tooltip au hover
 * - Gérer le clic pour naviguer vers un channel
 */

'use client';


import { Channel, ChannelType } from '@domain/channels/types';
import { Server } from '@domain/servers/types';
import { useMessageStore } from '@application/messages/messageStore';
import { Icon } from '@presentation/components/common/Icon';

interface ServerChannelsSidebarCollapsedProps {
  server: Server;
  channels: Channel[];
  activeChannelId?: string;
  onChannelClick?: (channelId: string) => void;
  onExpandClick?: () => void;
  onSearchClick?: () => void;
}

/**
 * Icône selon le type de channel
 */
function getChannelIcon(type: ChannelType): React.ReactElement {
  switch (type) {
    case ChannelType.TEXT:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"/>
        </svg>
      );
    case ChannelType.VOICE:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3C10.34 3 9 4.34 9 6V10C9 11.66 10.34 13 12 13C13.66 13 15 11.66 15 10V6C15 4.34 13.66 3 12 3ZM18.5 10C18.5 10 18.5 10.26 18.48 10.58C18.27 13.4 16.05 15.62 13.23 15.88V18.96H16V21H8V18.96H10.77V15.88C7.95 15.62 5.73 13.4 5.52 10.58C5.5 10.26 5.5 10 5.5 10H7.5C7.5 10 7.5 10.18 7.51 10.41C7.67 12.67 9.5 14.5 12 14.5C14.5 14.5 16.33 12.67 16.49 10.41C16.5 10.18 16.5 10 16.5 10H18.5Z"/>
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"/>
        </svg>
      );
  }
}

/**
 * Composant ServerChannelsSidebarCollapsed
 */
export function ServerChannelsSidebarCollapsed({
  server,
  channels,
  activeChannelId,
  onChannelClick,
  onExpandClick,
  onSearchClick,
}: ServerChannelsSidebarCollapsedProps): React.ReactElement {
  const getMentionCount = useMessageStore((state) => state.getMentionCount);
  
  // Trier les channels par position
  const sortedChannels = [...channels].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return (
    <div className="w-[72px] h-full bg-card flex flex-col border-r border-border">
      {/* Server Header - Collapsed */}
      <div 
        className="h-12 flex items-center justify-center border-b border-border cursor-pointer hover:bg-accent transition-colors group"
        onClick={onExpandClick}
        title={server.name}
      >
        <div className="relative">
          {/* Server Icon or Initial */}
          {server.icon ? (
            <img 
              src={server.icon} 
              alt={server.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-foreground">
                {server.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Expand indicator */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center border border-border opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-3 h-3 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.4 18L8 16.6L12.6 12L8 7.4L9.4 6L15.4 12L9.4 18Z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Channels List - Icons only */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <div className="flex flex-col gap-1 px-2">
          {sortedChannels.map((channel, index) => {
            const isActive = channel.id === activeChannelId;
            const mentionCount = getMentionCount(channel.id);
            const isPinned = index === 0;
            
            return (
              <div 
                key={channel.id} 
                className="relative group"
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-foreground rounded-r-full -ml-2" />
                )}
                
                {/* Channel Button */}
                <button
                  onClick={() => onChannelClick?.(channel.id)}
                  className={`
                    w-full h-11 flex items-center justify-center
                    rounded-md transition-all duration-200
                    ${isActive 
                      ? 'bg-accent text-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }
                  `}
                  aria-label={channel.name}
                >
                  {getChannelIcon(channel.type)}
                </button>
                  {isPinned && (
                    <div className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm border border-background">
                      <Icon name="pin" size={9} className="text-primary-foreground" />
                    </div>
                  )}
                {mentionCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-sm"
                    aria-label={`Mentions: ${mentionCount}`}
                  >
                    @{mentionCount}
                  </span>
                )}

                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-popover text-popover-foreground text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-border shadow-lg">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(channel.type)}
                    <span>{channel.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions - Collapsed */}
      <div className="flex flex-col gap-2 p-2 border-t border-border">
        {/* Notifications */}
        <button
          className="w-full h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"/>
          </svg>
        </button>

        {/* Search */}
        <button
          onClick={onSearchClick}
          className="w-full h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          aria-label="Rechercher"
          title="Rechercher"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
