using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Quobject.SocketIoClientDotNet.Client;
using Newtonsoft.Json;
using System;

[Serializable]
public class Telemetry{

	public int roll;
	public int pitch;
	public int heading;

    public float coretemp;
	public float temp;
	public float voltage;
    public float airpressure;
	public float depth;

	public float left_depth_speed;
    public float right_depth_speed;

    public float right_speed;
	public float left_speed;
};

[Serializable]
public class Settings
{
	public int general_mult = 100;

	public int right_depth_mult = 100;
    public int left_depth_mult = 100;

	public int right_mult = 100;
	public int left_mult = 100;

	public string battery = "SLA AGM 12V";

    public string stream_res = "1640x1232";
    public string record_res = "1640x1232";
    public int fps = 24;

    public string water_type = "Salt Water";
    public float depth_offset = 0;

    public string meter_mode = "average";
    public string exposure_mode = "night";

    public string hdd_space = "?";

    public bool recording = false;

	public bool right_depth_invert = false;
    public bool left_depth_invert = false;

    public bool right_invert = false;
	public bool left_invert = false;

	public int tgtHeading = 0;
	public bool autoHeading = false;

	public float tgtDepth = 0;
	public bool autoDepth = false;

	public float heading_P = 0f;
	public float depth_P = 0f;
    public float balance_P = 0f;
};

[Serializable]
class MotorMult
{
	public string channel;
	public int val;

	public MotorMult(string channel, int val)
	{
		this.channel = channel;
		this.val = val;
	}
}

[Serializable]
class AutoHeading //degrees
{
	public bool active;
	public int tgt;

	public AutoHeading(bool active, int tgt)
	{
		this.active = active;
		this.tgt = tgt;
	}
}

[Serializable]
class AutoDepth //meters
{
	public bool active;
	public float depth;

	public AutoDepth(bool active, float depth)
	{
		this.active = active;
		this.depth = depth;
	}
}

[Serializable]
class MotorSpeed
{
	public int left;
	public int right;

	public MotorSpeed(int right, int left)
	{
		this.left = left;
		this.right = right;
	}
}

[Serializable]
class PID
{
	public float p;
	public float i;
	public float d;

	public PID(float p, float i, float d)
	{
		this.p = p;
		this.i = i;
		this.d = d;
	}
}

[Serializable]
class CameraSettings
{
    public string stream_res;
    public string record_res;
    public string meter_mode;
    public string exposure_mode;
    public bool recording = false;
    public int fps;

    public CameraSettings(string stream_res, string record_res, string meter_mode, string exposure_mode, bool recording, int fps)
    {
        this.stream_res = stream_res;
        this.record_res = record_res;
        this.meter_mode = meter_mode;
        this.exposure_mode = exposure_mode;
        this.recording = recording;
        this.fps = fps;
    }
}

[Serializable]
class BashResult
{
    public string data;
    public int code;

    public BashResult(string data, int code)
    {
        this.data = data;
        this.code = code;
    }
}

public class SocketIOScript : MonoBehaviour {

	public string serverURL = "192.168.1.120:3000";
	public string status = "Idle";
	public long lastTelemetryTime = 0;

    public MjpegTexture streampanel;

	public Telemetry livedata;
	public Settings settings = new Settings();

	public Text connectioninfo;
	public Text heading;
	public Text temp;
    public Text cputemp;
    public Text pressure;
    public Text roll;
	public Text pitch;

	private Color white = new Color(1f, 1f, 1f, 1f);
	private Color red = new Color(1f, 0f, 0f, 1f);

    public TerminalHandler terminal;

	private Socket socket = null;

	private bool updateView = false;

	void Start() {
		Connect("Attempting to connect...");
		InvokeRepeating("Reconnect", 5.0f, 5.0f);
        InvokeRepeating("StayinAlive", 1.0f, 0.5f);

        Application.targetFrameRate = 30;
	}

    void OnApplicationQuit()
    {
        Disconnect();
    }

    void Update() {

		//Debug.Log("FPS:"+(int)(1f / Time.unscaledDeltaTime));

		if (string.Equals(status, "Connected") && livedata != null){
			heading.text = "HDG " + livedata.heading.ToString("000") + (char)176;
			temp.text = livedata.temp.ToString("#0") + (char)176 + "C";
            cputemp.text = livedata.coretemp.ToString("#0") + (char)176 + "C";
            roll.text = "Roll: " + livedata.roll + (char)176;
			pitch.text = "Pitch: " + livedata.pitch + (char)176;
            pressure.text = ((livedata.airpressure+193f)/ 1000f).ToString("F")+" bar";

            if (livedata.temp > 55){
				temp.color = red;
				temp.transform.GetChild(0).gameObject.GetComponent<Image>().color = red;
			}else{
				temp.color = white;
				temp.transform.GetChild(0).gameObject.GetComponent<Image>().color = white;
			}

            if (livedata.coretemp > 65){
                cputemp.color = red;
                cputemp.transform.GetChild(0).gameObject.GetComponent<Image>().color = red;
            }else{
                cputemp.color = white;
                cputemp.transform.GetChild(0).gameObject.GetComponent<Image>().color = white;
            }


            if (connectioninfo.IsActive()){
				heading.gameObject.SetActive(true);
				temp.gameObject.SetActive(true);
                cputemp.gameObject.SetActive(true);
                pressure.gameObject.SetActive(true);

                connectioninfo.gameObject.SetActive(false);
            }
		}
		else{
			connectioninfo.text = status;
			if (!connectioninfo.IsActive()){
				heading.gameObject.SetActive(false);
				temp.gameObject.SetActive(false);
                cputemp.gameObject.SetActive(false);
                pressure.gameObject.SetActive(false);

                connectioninfo.gameObject.SetActive(true);
            }
		}

		if (updateView){
			ViewSettingChange();
			updateView = false;
		}
	}

	public void Connect(string info)
	{
		Disconnect();
		status = info;

        IO.Options options = new IO.Options();
        options.Timeout = 1;

        socket = IO.Socket("http://" + serverURL+ ":3000", options);
		socket.On(Socket.EVENT_CONNECT, () =>	{
			socket.Emit("connected");
			status = "Connected";

            streampanel.StartStream("http://" + serverURL+ ":5000/stream.mjpg");
        });

        socket.On(Socket.EVENT_DISCONNECT, () =>	{
			status = "Disconnected";
		});

		socket.On("data", (data) => {
            livedata = JsonConvert.DeserializeObject<Telemetry>(data.ToString());
			lastTelemetryTime = DateTime.Now.Ticks;
		});

        socket.On("log", (data) => {
            Debug.Log("TERMINAL LOG: " + data.ToString());
            terminal.DisplayFeedback(data.ToString());
        });

        socket.On("streamUpdated", (data) => {
            streampanel.StartStream("http://" + serverURL + ":5000/stream.mjpg");
        });

        socket.On("settings", (data) =>	{
           //Debug.Log(data.ToString());
            settings = JsonConvert.DeserializeObject<Settings>(data.ToString());
            //Debug.Log("Setting Update: "+JsonUtility.ToJson(settings));

            updateView = true;
		});
	}

	void Reconnect(){
		if (socket != null && string.Equals(status, "Disconnected")){
			//Connect("Attempting to reconnect...");
		}
	}

	public void Disconnect(){
		if (socket != null){
			socket.Disconnect();
			socket = null;
			status = "Disconnected";
        }
	}

	public void TakeUrlFromForm(Text textbox){
		serverURL = textbox.text;
	}

	void Destroy(){
		Disconnect();
	}

	// ---  UI Update ---

	void ViewSettingChange()
	{
        GameObject batt = GameObject.Find("Modal_Battery");
        if (batt != null)
            batt.GetComponent<BatteryHandler>().SettingsUpdate();

        GameObject camera = GameObject.Find("Modal_Camera");
        if (camera != null)
            camera.GetComponent<CameraHandler>().SettingsUpdate();

        GameObject pids = GameObject.Find("Modal_ROVCfg");
		if (pids != null)
			pids.GetComponent<RovCfgHandler>().SettingsUpdate();

        Debug.Log("viewsettingchange");

	}

    // ---  Input Handlers ---

    public void TakePhoto(){
        if (socket != null){
            socket.Emit("photo");
        }
    }

    public void TakeGallery()
    {
        if (socket != null){
            socket.Emit("gallery");
        }
    }


    public void SendBashCmd(string cmd)
    {
        if (socket != null)
        {
            socket.Emit("bashcmd", cmd);
        }
    }

    // -- //

    public void SetHeadingP(float p)
	{
		if (socket != null){
			socket.Emit("headingP", p + "");
		}
	}

	public void SetDepthP(float p)
	{
		if (socket != null){
			socket.Emit("depthP", p + "");
		}
	}

    public void SetBalanceP(float p)
    {
        if (socket != null)
        {
            socket.Emit("balanceP", p + "");
        }
    }

    public void SetDepthMotorsSpeed(int right, int left)
    {
        if (socket != null)
        {
            socket.Emit("depthspeed", JsonUtility.ToJson(new MotorSpeed(right, left)));
        }
    }

    public void SetForwardMotorsSpeed(int right, int left)
	{
		if (socket != null){
			socket.Emit("motorspeed", JsonUtility.ToJson(new MotorSpeed(right, left)));
		}
	}

	public void SetAutoDepth(bool active, float tgt)
	{
		if (socket != null){
			socket.Emit("autodepth", JsonUtility.ToJson(new AutoDepth(active, tgt)));
		}
	}

	public void SetAutoHeading(bool active, int tgt)
	{
		if (socket != null){
			socket.Emit("autoheading", JsonUtility.ToJson(new AutoHeading(active, tgt)));
		}
	}

    // -- //

    public void SetBattery(Text type){
		if (socket != null){
			socket.Emit("battery", type.text);
		}
	}

    public void SetWaterType(String type)
    {
        if (socket != null){
            socket.Emit("water", type);
        }
    }

    public void SetZeroDepth()
    {
        if (socket != null)
        {
            socket.Emit("zerodepth");
        }
    }

    // -- //

    public void SetCameraSettings(string stream_res, string record_res, string meter_mode, string exposure_mode, bool recording, int fps)
    {
        if (socket != null){
            socket.Emit("camera_cfg", JsonUtility.ToJson(new CameraSettings(stream_res, record_res, meter_mode, exposure_mode, recording, fps)));
        }
    }

    // -- //

    public void ToggleMotorDir(string channel){
		if (socket != null){
			socket.Emit("motordir", channel);
		}
	}

    // -- //

	void MotorMultipliers(string channel, string value)
	{
        //Debug.Log(channel + " " + value);

		int mult = int.Parse(value.Replace("%", ""));
		if (socket != null){
			socket.Emit("motormult", JsonUtility.ToJson(new MotorMult(channel, mult)));
		}
	}

    public void RightDepthMotorMultiplier(Text data) {
        MotorMultipliers("rightdepth", data.text);
    }

    public void LeftDepthMotorMultiplier(Text data) {
		MotorMultipliers("leftdepth", data.text);
	}

	public void LeftMotorMultiplier(Text data) {
		MotorMultipliers("left", data.text);
	}

	public void RightMotorMultiplier(Text data) {
		MotorMultipliers("right", data.text);
	}

	public void GeneralMotorMultiplier(Text data) {
		MotorMultipliers("all", data.text);
	}


    void StayinAlive()
    {
        if (socket != null){
            socket.Emit("keepalive");
        }
    }

}
