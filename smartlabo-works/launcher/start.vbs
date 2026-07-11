Dim WshShell, fso
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim appDir
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
appDir = fso.GetParentFolderName(appDir)

WshShell.Run "cmd /c taskkill /f /im node.exe 2>nul", 0, True
WScript.Sleep 500

Dim nodePath, serverScript
nodePath = "C:\Program Files\nodejs\node.exe"
serverScript = appDir & "\server.js"

WshShell.Run """" & nodePath & """ """ & serverScript & """", 0, False
WScript.Sleep 2000

Dim sChrome, sEdge
sChrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
sEdge   = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

If fso.FileExists(sChrome) Then
    WshShell.Run """" & sChrome & """ --app=http://localhost:3006/app.html --window-size=1440,900"
ElseIf fso.FileExists(sEdge) Then
    WshShell.Run """" & sEdge & """ --app=http://localhost:3006/app.html --window-size=1440,900"
Else
    WshShell.Run "http://localhost:3006/app.html"
End If

Set WshShell = Nothing
Set fso = Nothing
