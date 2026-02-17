#!/bin/bash
#
# install-quick-action.sh - 「動画をMP3に変換」クイックアクションをインストール
#
# macOS の Finder 右クリックメニューに「動画をMP3に変換」を追加します。
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONVERTER_SCRIPT="$SCRIPT_DIR/video-to-mp3.sh"
WORKFLOW_NAME="動画をMP3に変換"
WORKFLOW_DIR="$HOME/Library/Services/${WORKFLOW_NAME}.workflow"

# video-to-mp3.sh が存在するか確認
if [ ! -f "$CONVERTER_SCRIPT" ]; then
    echo "エラー: video-to-mp3.sh が見つかりません" >&2
    echo "このスクリプトと同じディレクトリに video-to-mp3.sh を配置してください" >&2
    exit 1
fi

echo "クイックアクション「${WORKFLOW_NAME}」をインストールします..."

# Services ディレクトリを作成
mkdir -p "$HOME/Library/Services"

# 既存のワークフローがあれば削除
if [ -d "$WORKFLOW_DIR" ]; then
    echo "既存のワークフローを上書きします..."
    rm -rf "$WORKFLOW_DIR"
fi

# Automator ワークフローの構造を作成
mkdir -p "$WORKFLOW_DIR/Contents"

# Info.plist を作成
cat > "$WORKFLOW_DIR/Contents/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
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
		</dict>
	</array>
</dict>
</plist>
PLIST

# document.wflow を作成
cat > "$WORKFLOW_DIR/Contents/document.wflow" << WFLOW
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
					<string>export PATH="/usr/local/bin:/opt/homebrew/bin:\$PATH"
"${CONVERTER_SCRIPT}" "\$@"</string>
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
				<string>A0A0A0A0-B1B1-C2C2-D3D3-E4E4E4E4E4E4</string>
				<key>Keywords</key>
				<array>
					<string>Shell</string>
					<string>Script</string>
				</array>
				<key>OutputUUID</key>
				<string>F5F5F5F5-A6A6-B7B7-C8C8-D9D9D9D9D9D9</string>
				<key>UUID</key>
				<string>11111111-2222-3333-4444-555555555555</string>
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
WFLOW

echo ""
echo "インストール完了!"
echo ""
echo "場所: $WORKFLOW_DIR"
echo ""
echo "使い方:"
echo "  1. Finder で動画ファイルを右クリック"
echo "  2. 「クイックアクション」>「${WORKFLOW_NAME}」を選択"
echo "  3. 同じフォルダに MP3 ファイルが生成されます"
echo ""
echo "※ 複数ファイルを選択して一括変換も可能です"
echo "※ ffmpeg が必要です（brew install ffmpeg）"
echo ""
echo "メニューに表示されない場合:"
echo "  システム設定 > プライバシーとセキュリティ > 機能拡張 > Finder"
echo "  で「${WORKFLOW_NAME}」にチェックが入っているか確認してください"
