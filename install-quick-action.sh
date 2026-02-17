#!/bin/bash
#
# install-quick-action.sh - 「動画をMP3に変換」クイックアクションをインストール
#
# macOS の Finder 右クリックメニューに「動画をMP3に変換」を追加します。
# 変換ロジックはワークフロー内に直接埋め込まれるため、
# インストール後はこのリポジトリを削除しても動作します。
#

set -euo pipefail

WORKFLOW_NAME="動画をMP3に変換"
WORKFLOW_DIR="$HOME/Library/Services/${WORKFLOW_NAME}.workflow"

echo "クイックアクション「${WORKFLOW_NAME}」をインストールします..."
echo ""

# Services ディレクトリを作成
mkdir -p "$HOME/Library/Services"

# 既存のワークフローがあれば削除
if [ -d "$WORKFLOW_DIR" ]; then
    echo "既存のワークフローを上書きします..."
    rm -rf "$WORKFLOW_DIR"
fi

# Automator ワークフローの構造を作成
mkdir -p "$WORKFLOW_DIR/Contents"

# ---- Info.plist ----
cat > "$WORKFLOW_DIR/Contents/Info.plist" << 'PLIST_END'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleName</key>
	<string>動画をMP3に変換</string>
	<key>CFBundleIdentifier</key>
	<string>com.user.video-to-mp3</string>
	<key>CFBundleVersion</key>
	<string>1.0</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundlePackageType</key>
	<string>BNDL</string>
	<key>NSServices</key>
	<array>
		<dict>
			<key>NSMenuItem</key>
			<dict>
				<key>default</key>
				<string>動画をMP3に変換</string>
			</dict>
			<key>NSMessage</key>
			<string>runWorkflowAsService</string>
			<key>NSSendFileTypes</key>
			<array>
				<string>public.movie</string>
				<string>public.video</string>
				<string>public.mpeg-4</string>
				<string>com.apple.quicktime-movie</string>
				<string>public.avi</string>
				<string>public.item</string>
			</array>
		</dict>
	</array>
</dict>
</plist>
PLIST_END

# ---- document.wflow ----
# 変換ロジックを直接ワークフロー内に埋め込む（外部スクリプト不要）
cat > "$WORKFLOW_DIR/Contents/document.wflow" << 'WFLOW_END'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>AMApplicationBuild</key>
	<string>523</string>
	<key>AMApplicationVersion</key>
	<string>2.10</string>
	<key>AMDocumentVersion</key>
	<integer>2</integer>
	<key>actions</key>
	<array>
		<dict>
			<key>action</key>
			<dict>
				<key>AMAccepts</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Optional</key>
					<false/>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.path</string>
					</array>
				</dict>
				<key>AMActionVersion</key>
				<string>1.0.2</string>
				<key>AMApplication</key>
				<array>
					<string>Automator</string>
				</array>
				<key>AMBundleIdentifier</key>
				<string>com.apple.RunShellScript</string>
				<key>AMCategory</key>
				<array>
					<string>AMCategoryUtilities</string>
				</array>
				<key>AMIconName</key>
				<string>Automator</string>
				<key>AMKeywords</key>
				<array>
					<string>Shell</string>
					<string>Script</string>
				</array>
				<key>AMName</key>
				<string>シェルスクリプトを実行</string>
				<key>AMProvides</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.path</string>
					</array>
				</dict>
				<key>AMRequiredResources</key>
				<array/>
				<key>ActionBundlePath</key>
				<string>/System/Library/Automator/Run Shell Script.action</string>
				<key>ActionName</key>
				<string>シェルスクリプトを実行</string>
				<key>ActionParameters</key>
				<dict>
					<key>COMMAND_STRING</key>
					<string>#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v ffmpeg &amp;&gt;/dev/null; then
    osascript -e 'display dialog "ffmpeg がインストールされていません。\n\nbrew install ffmpeg\n\nでインストールしてください。" with title "Video to MP3" buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

VIDEO_EXTENSIONS="mp4|mkv|avi|mov|wmv|flv|webm|m4v|ts|mts|m2ts|3gp|ogv"
success_count=0
fail_count=0

for input_file in "$@"; do
    [ ! -f "$input_file" ] &amp;&amp; continue

    ext="${input_file##*.}"
    ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
    echo "$ext_lower" | grep -qiE "^($VIDEO_EXTENSIONS)$" || continue

    dir=$(dirname "$input_file")
    name=$(basename "$input_file" ".$ext")
    output_file="$dir/${name}.mp3"

    counter=1
    while [ -f "$output_file" ]; do
        output_file="$dir/${name} (${counter}).mp3"
        ((counter++))
    done

    if ffmpeg -i "$input_file" -vn -acodec libmp3lame -ab 192k -ar 44100 -y "$output_file" 2&gt;/dev/null; then
        ((success_count++))
    else
        [ -f "$output_file" ] &amp;&amp; rm -f "$output_file"
        ((fail_count++))
    fi
done

if [ "$success_count" -gt 0 ]; then
    osascript -e "display notification \"${success_count}個のファイルをMP3に変換しました\" with title \"Video to MP3\""
elif [ "$fail_count" -gt 0 ]; then
    osascript -e 'display notification "変換に失敗しました" with title "Video to MP3"'
fi</string>
					<key>CheckedForUserDefaultShell</key>
					<true/>
					<key>inputMethod</key>
					<integer>1</integer>
					<key>shell</key>
					<string>/bin/bash</string>
					<key>source</key>
					<string></string>
				</dict>
				<key>BundleIdentifier</key>
				<string>com.apple.RunShellScript</string>
				<key>CFBundleVersion</key>
				<string>1.0.2</string>
				<key>CanShowSelectedItemsWhenRun</key>
				<true/>
				<key>CanShowWhenRun</key>
				<true/>
				<key>Category</key>
				<array>
					<string>AMCategoryUtilities</string>
				</array>
				<key>Class Name</key>
				<string>RunShellScriptAction</string>
				<key>InputUUID</key>
				<string>820817C1-854B-4BF7-93C6-D738A3D5D3E0</string>
				<key>Keywords</key>
				<array>
					<string>Shell</string>
					<string>Script</string>
				</array>
				<key>OutputUUID</key>
				<string>F3B614D2-7A5C-4E8E-B1D9-2C6F4A8E9B01</string>
				<key>UUID</key>
				<string>A7C9E3B1-4D2F-8A6E-C5B0-1F3D7E9A2B4C</string>
				<key>UnlocalizedApplications</key>
				<array>
					<string>Automator</string>
				</array>
				<key>arguments</key>
				<dict>
					<key>0</key>
					<dict>
						<key>default value</key>
						<integer>0</integer>
						<key>name</key>
						<string>inputMethod</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<integer>0</integer>
						<key>uuid</key>
						<string>0</string>
					</dict>
					<key>1</key>
					<dict>
						<key>default value</key>
						<string></string>
						<key>name</key>
						<string>source</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<integer>0</integer>
						<key>uuid</key>
						<string>1</string>
					</dict>
					<key>2</key>
					<dict>
						<key>default value</key>
						<false/>
						<key>name</key>
						<string>CheckedForUserDefaultShell</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<integer>0</integer>
						<key>uuid</key>
						<string>2</string>
					</dict>
					<key>3</key>
					<dict>
						<key>default value</key>
						<string></string>
						<key>name</key>
						<string>COMMAND_STRING</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<integer>0</integer>
						<key>uuid</key>
						<string>3</string>
					</dict>
					<key>4</key>
					<dict>
						<key>default value</key>
						<string>/bin/sh</string>
						<key>name</key>
						<string>shell</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<integer>0</integer>
						<key>uuid</key>
						<string>4</string>
					</dict>
				</dict>
				<key>isViewVisible</key>
				<integer>1</integer>
				<key>location</key>
				<string>529.000000:620.000000</string>
				<key>nibPath</key>
				<string>/System/Library/Automator/Run Shell Script.action/Contents/Resources/Base.lproj/main.nib</string>
			</dict>
		</dict>
	</array>
	<key>connectors</key>
	<dict/>
	<key>workflowMetaData</key>
	<dict>
		<key>applicationBundleIDsByPath</key>
		<dict/>
		<key>applicationPaths</key>
		<array/>
		<key>inputTypeIdentifier</key>
		<string>com.apple.Automator.fileSystemObject</string>
		<key>outputTypeIdentifier</key>
		<string>com.apple.Automator.nothing</string>
		<key>presentationMode</key>
		<integer>15</integer>
		<key>processesInput</key>
		<integer>0</integer>
		<key>serviceInputTypeIdentifier</key>
		<string>com.apple.Automator.fileSystemObject</string>
		<key>serviceOutputTypeIdentifier</key>
		<string>com.apple.Automator.nothing</string>
		<key>serviceProcessesInput</key>
		<integer>0</integer>
		<key>systemImageName</key>
		<string>NSTouchBarAudioOutputVolumeMedium</string>
		<key>useAutomaticInputType</key>
		<integer>0</integer>
		<key>workflowTypeIdentifier</key>
		<string>com.apple.Automator.servicesMenu</string>
	</dict>
</dict>
</plist>
WFLOW_END

echo "ワークフローを配置しました: $WORKFLOW_DIR"
echo ""

# サービスキャッシュを更新して Finder に認識させる
echo "サービスキャッシュを更新中..."
/System/Library/CoreServices/pbs -update 2>/dev/null || true
killall Finder 2>/dev/null || true

sleep 1
echo ""
echo "============================="
echo " インストール完了!"
echo "============================="
echo ""
echo "使い方:"
echo "  1. Finder で動画ファイルを右クリック"
echo "  2.「クイックアクション」>「${WORKFLOW_NAME}」を選択"
echo "  3. 同じフォルダに MP3 ファイルが生成されます"
echo ""
echo "※ 複数ファイルを選択して一括変換も可能です"
echo "※ ffmpeg が必要です（brew install ffmpeg）"
echo ""
echo "表示されない場合:"
echo "  1. システム設定 > プライバシーとセキュリティ > 機能拡張 > Finder"
echo "     で「${WORKFLOW_NAME}」が有効になっているか確認"
echo "  2. 一度ログアウト→ログインすると反映されることがあります"
echo ""
echo "アンインストール:"
echo "  rm -rf \"$WORKFLOW_DIR\""
