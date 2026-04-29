import { Sparkles, LogIn } from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-200">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">甲油胶仓库</h1>
          <p className="text-sm text-gray-500">你的色彩收藏夹</p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="text-center mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              欢迎回来
            </h2>
            <p className="text-sm text-gray-500">
              登录后即可管理你的甲油胶收藏
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 active:bg-pink-700 transition-colors shadow-sm shadow-pink-200"
          >
            <LogIn className="w-4 h-4" />
            使用 Kimi 账号登录
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            登录即表示你同意使用本服务
          </p>
        </div>

        {/* 功能介绍 */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "订单识别", desc: "截图自动提取" },
            { label: "色系统计", desc: "一目了然" },
            { label: "试色生成", desc: "统一甲片样式" },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-3 bg-white rounded-xl border border-gray-100"
            >
              <p className="text-xs font-semibold text-gray-700">
                {item.label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
