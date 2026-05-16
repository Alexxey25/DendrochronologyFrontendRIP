use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct TauriInvokeArgs {
  cmd: String,
}

/// Команда для вызова из React: invoke('tauri', { cmd: 'create' | 'close' })
#[tauri::command]
fn tauri(args: TauriInvokeArgs) -> Result<(), String> {
  match args.cmd.as_str() {
    "create" => {
      log::info!("tauri cmd: create");
      Ok(())
    }
    "close" => {
      log::info!("tauri cmd: close");
      Ok(())
    }
    other => Err(format!("unknown cmd: {other}")),
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![tauri])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
