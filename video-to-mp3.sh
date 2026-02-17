#!/bin/bash
#
# video-to-mp3.sh - 動画ファイルから音声を抽出してMP3に変換するスクリプト
#
# 使い方: video-to-mp3.sh <動画ファイル> [動画ファイル2] ...
# 出力:   元のファイルと同じディレクトリに .mp3 ファイルを生成
#

set -euo pipefail

# ffmpeg がインストールされているか確認
if ! command -v ffmpeg &>/dev/null; then
    osascript -e 'display dialog "ffmpeg がインストールされていません。\n\nbrew install ffmpeg\n\nでインストールしてください。" with title "Video to MP3" buttons {"OK"} default button "OK" with icon stop' 2>/dev/null \
        || echo "エラー: ffmpeg がインストールされていません。brew install ffmpeg でインストールしてください。" >&2
    exit 1
fi

# 引数チェック
if [ $# -eq 0 ]; then
    echo "使い方: $0 <動画ファイル> [動画ファイル2] ..." >&2
    exit 1
fi

# 対応する動画拡張子
VIDEO_EXTENSIONS="mp4|mkv|avi|mov|wmv|flv|webm|m4v|ts|mts|m2ts|3gp|ogv"

success_count=0
fail_count=0
skip_count=0

for input_file in "$@"; do
    # ファイルが存在するか確認
    if [ ! -f "$input_file" ]; then
        echo "スキップ: '$input_file' が見つかりません" >&2
        ((skip_count++))
        continue
    fi

    # 拡張子チェック
    ext="${input_file##*.}"
    ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
    if ! echo "$ext_lower" | grep -qiE "^($VIDEO_EXTENSIONS)$"; then
        echo "スキップ: '$input_file' は対応していない形式です ($ext)" >&2
        ((skip_count++))
        continue
    fi

    # 出力ファイル名を生成（拡張子を .mp3 に置換）
    dir=$(dirname "$input_file")
    basename=$(basename "$input_file")
    name="${basename%.*}"
    output_file="$dir/${name}.mp3"

    # 同名ファイルが存在する場合は連番を付与
    counter=1
    while [ -f "$output_file" ]; do
        output_file="$dir/${name} (${counter}).mp3"
        ((counter++))
    done

    echo "変換中: $(basename "$input_file") -> $(basename "$output_file")"

    # ffmpeg で音声抽出・MP3変換
    if ffmpeg -i "$input_file" -vn -acodec libmp3lame -ab 192k -ar 44100 -y "$output_file" 2>/dev/null; then
        echo "完了: $(basename "$output_file")"
        ((success_count++))
    else
        echo "エラー: '$(basename "$input_file")' の変換に失敗しました" >&2
        # 不完全な出力ファイルがあれば削除
        [ -f "$output_file" ] && rm -f "$output_file"
        ((fail_count++))
    fi
done

# 結果サマリー（複数ファイルの場合）
total=$((success_count + fail_count + skip_count))
if [ "$total" -gt 1 ]; then
    echo ""
    echo "--- 結果 ---"
    echo "成功: ${success_count} / 失敗: ${fail_count} / スキップ: ${skip_count}"
fi

# macOS通知（Automator Quick Action から呼ばれた場合用）
if [ "$success_count" -gt 0 ]; then
    osascript -e "display notification \"${success_count}個のファイルをMP3に変換しました\" with title \"Video to MP3\"" 2>/dev/null || true
fi

if [ "$fail_count" -gt 0 ]; then
    exit 1
fi
