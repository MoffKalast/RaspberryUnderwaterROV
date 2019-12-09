using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class CameraHandler : MonoBehaviour
{

    public Text hdd_data;

    public Text stream_res;
    public Text record_res;
    public Text meter_mode;
    public Text exposure_mode;
    public Text fps_placeholder;
    public Text fps_text;

    public Toggle do_record;
    public Text displaytext;

    private Color white = new Color(1f, 1f, 1f, 1f);
    private Color red = new Color(0.9f, 0.18f, 0f, 1f);

    private SocketIOScript socket;

    void Start()
    {
        socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();
        SettingsUpdate();
    }

    public void SettingsUpdate()
    {
        if(socket.settings.hdd_space != null)
            hdd_data.text = "Disk space: "+socket.settings.hdd_space;

        if (socket.settings.recording)
            displaytext.color = red;
        else
            displaytext.color = white;

        stream_res.text = socket.settings.stream_res;
        record_res.text = socket.settings.record_res;

        meter_mode.text = socket.settings.meter_mode;
        exposure_mode.text = socket.settings.exposure_mode;

        fps_placeholder.text = socket.settings.fps + "";
        do_record.isOn = socket.settings.recording;
    }

    public void applySettings()
    {
        string streamRES = stream_res.text;
        string recordRES = record_res.text.Split(' ')[0];
        string meterMODE = meter_mode.text;
        string exposureMODE = exposure_mode.text;

        string fps = fps_text.text.Trim();

        if (fps.Length == 0)
            fps = fps_placeholder.text.Trim();

        int FPS = int.Parse(fps_text.text);
        bool record = do_record.isOn;

        Debug.Log(streamRES + " " + recordRES + " " + FPS + " " + record);

        socket.SetCameraSettings(streamRES, recordRES, meterMODE, exposureMODE, record, FPS);
    }
}
