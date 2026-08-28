/**
 * Dựng URL public cho file Directus (favicon/logo, preview_image bài viết).
 *
 * Mặc định trỏ thẳng `${directusUrl}/assets/`. Nếu env `asset_url` được set
 * (vd CDN/reverse-proxy public đứng trước Directus, xem .env), dùng nó làm
 * base thay thế — tự chuẩn hoá có/không có dấu `/` cuối để nối id không bị
 * lặp hoặc thiếu slash.
 */
export function resolveAssetBase(directusUrl) {
  const override = process.env.asset_url?.trim();
  const base = override || `${directusUrl.replace(/\/$/, "")}/assets`;
  return base.endsWith("/") ? base : `${base}/`;
}

export function buildAssetUrl(id, directusUrl) {
  return id ? `${resolveAssetBase(directusUrl)}${id}` : null;
}

/**
 * Rich-text (description/body) chứa <img src="..."> do editor Directus tự
 * ghi lúc chọn ảnh — là URL tuyệt đối `${directusUrl}/assets/<id>`, không
 * phải id rời để build lại như preview_image. Khi có `asset_url`, thay thế
 * đúng phần prefix đó để ảnh trong nội dung cũng đi qua base mới.
 */
export function rewriteAssetUrls(text, directusUrl) {
  const override = process.env.asset_url?.trim();
  if (!text || !override) return text;
  const directusBase = `${directusUrl.replace(/\/$/, "")}/assets/`;
  return text.split(directusBase).join(resolveAssetBase(directusUrl));
}
