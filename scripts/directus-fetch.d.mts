export interface DirectusFetchOptions {
  token?: string;
  init?: RequestInit;
  /** Phần hiện trong thông báo lỗi; mặc định là cả URL. */
  label?: string;
  /** 0 = tắt hạn giờ. */
  timeoutMs?: number;
  attempts?: number;
}

export declare function directusFetch(
  url: string,
  opts?: DirectusFetchOptions,
): Promise<Response>;

export declare function directusGet(
  base: string,
  path: string,
  opts?: DirectusFetchOptions,
): Promise<unknown>;
