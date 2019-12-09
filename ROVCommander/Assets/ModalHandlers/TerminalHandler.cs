using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class TerminalHandler : MonoBehaviour {

    public Text console;
    public InputField cmd;

    private SocketIOScript socket;

    public string append = "";

    void Start () {
        console.text = "";
        socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();
    }

    void Update()
    {
        if(append.Length > 0)
        {
            AppendText(append);
            append = "";
        }
    }

    public void DisplayFeedback(string str)
    {
        append += str+'\n';
    }

    public void ClearWindow()
    {
        console.text = "";
    }

    public void SendCommand()
    {
        AppendText(" > " + cmd.text + '\n');
        socket.SendBashCmd(cmd.text);
    }

    private void AppendText(string text)
    {
        console.text += text;

        Canvas.ForceUpdateCanvases();

        int x = console.cachedTextGenerator.characterCountVisible;
        int y = console.text.Length;

        if (y - x > 0)
        {
            int pos = console.text.IndexOf('\n') + 1;
            console.text = console.text.Substring(pos, y - pos);
        }
    }
}
