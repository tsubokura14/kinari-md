# 見本のページの画像を撮るイメージ。Playwright 公式のイメージに、日本語の書体（太字と明朝）を足す。
# docs/design.md の「見本のページの画像は、日本語の書体を入れた Playwright のイメージで撮って比べる」
#
# 版は scripts/playwright-docker.mjs が、入れた @playwright/test の版を渡す（違うとブラウザが見つからない）
ARG PLAYWRIGHT_VERSION
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble

# 公式のイメージにある日本語の書体は Regular だけで、明朝もない。
# fonts-noto-cjk は Noto Sans CJK と Noto Serif CJK の Regular と Bold が入る。
# 版を固定するのは、書体が変わると画像が変わるため（noble の版。上げるときは画像を撮り直す）
RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-noto-cjk=1:20230817+repack1-3 \
    && rm -rf /var/lib/apt/lists/*

COPY fonts.conf /etc/fonts/local.conf
# fonts.conf が読めないと、fontconfig は警告だけ出して別名を使わずに進むので、当たっているかをここで確かめる
RUN fc-cache -f \
    && fc-match "Noto Serif JP:bold" | grep -q '"Noto Serif CJK JP" "Bold"' \
    && fc-match "Noto Sans JP:bold" | grep -q '"Noto Sans CJK JP" "Bold"'
