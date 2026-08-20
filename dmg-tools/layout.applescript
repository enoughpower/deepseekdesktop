tell application "Finder"
	tell disk "DeepSeek Harness"
		open
		set current view of container window to icon view
		set toolbar visible of container window to false
		set statusbar visible of container window to false
		set the bounds of container window to {0, 0, 660, 420}
		set icon size of the icon view options of container window to 88
		set arrangement of the icon view options of container window to not arranged
		set position of item "DeepSeekHarness.app" of container window to {156, 150}
		set position of item "Applications" of container window to {500, 150}
		update without registering applications
		close
	end tell
end tell
