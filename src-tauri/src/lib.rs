use base64;
use headless_chrome::{Browser, LaunchOptionsBuilder};
use serde::Serialize;

#[derive(Serialize)]
struct Ret {
    success: bool,
    message: Option<String>,
    data: Option<String>, // 网页内容或错误信息
}

#[tauri::command]
async fn fetch_url(url: String) -> Result<Ret, String> {
    println!("fetch website : {}", url);

    let launch_options = LaunchOptionsBuilder::default()
        .headless(true) // Ensure it runs headless
        .build()
        .unwrap();

    // 使用 match 处理错误
    match Browser::new(launch_options) {
        Ok(browser) => {
            match browser.new_tab() {
                Ok(tab) => {
                    if let Err(e) = tab.navigate_to(&url) {
                        return Ok(Ret {
                            success: false,
                            message: Some(format!("导航到URL失败: {}", e)),
                            data: None,
                        });
                    }

                    if let Err(e) = tab.wait_until_navigated() {
                        return Ok(Ret {
                            success: false,
                            message: Some(format!("等待页面加载失败: {}", e)),
                            data: None,
                        });
                    }

                    // 获取网页内容
                    match tab.get_content() {
                        Ok(content) => Ok(Ret {
                            success: true,
                            message: Some("成功获取网页内容".to_string()),
                            data: Some(content),
                        }),
                        Err(e) => Ok(Ret {
                            success: false,
                            message: Some(format!("获取网页内容失败: {}", e)),
                            data: None,
                        }),
                    }
                }
                Err(e) => Ok(Ret {
                    success: false,
                    message: Some(format!("创建新标签页失败: {}", e)),
                    data: None,
                }),
            }
        }
        Err(e) => Ok(Ret {
            success: false,
            message: Some(format!("启动浏览器失败: {}", e)),
            data: None,
        }),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![fetch_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
