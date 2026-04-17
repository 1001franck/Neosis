use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};
use tauri_plugin_notification::NotificationExt;

/// Commande appelable depuis le frontend TypeScript
/// Envoie une notification native Windows
#[tauri::command]
fn notify(app: tauri::AppHandle, title: String, body: String) {
    let _ = app.notification()
        .builder()
        .title(&title)
        .body(&body)
        .show();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            // Plugin de logs en mode debug
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Notification de bienvenue au démarrage
            let _ = app.notification()
                .builder()
                .title("Neosis")
                .body("Neosis est lancé et disponible dans le tray.")
                .show();


            // === SYSTEM TRAY ===
            // Menu contextuel du tray
            let show = MenuItem::with_id(app, "show", "Afficher Neosis", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quitter", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            // Icône dans la barre de notification
            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Neosis")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        // Afficher et mettre au premier plan
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    // Double-clic sur l'icône = afficher la fenêtre
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        if let Some(window) = tray.app_handle().get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        // Intercepter la fermeture de fenêtre : minimiser dans le tray au lieu de quitter
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Empêcher la fermeture réelle
                api.prevent_close();
                // Masquer la fenêtre (reste dans le tray)
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![notify])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
