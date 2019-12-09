using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using UnityEngine;
using System;

public class WifiHandler : MonoBehaviour {

	public Text dbm;
	public Text speed;
	public Slider dbm_slider;
	public Slider speed_slider;

	public Image dbm_fill;
	public Image speed_fill;

	private Color red = new Color(0.87f, 0.18f, 0f, 1f);
	private Color orange = new Color(0.95f, 0.65f, 0f, 1f);
	private Color blue = new Color(0f, 0.60f, 0.8f, 1f);
	private Color green = new Color(0f, 0.77f, 0.07f, 1f);

	void Update () {

		if (Application.platform == RuntimePlatform.Android)
		{
			//AndroidJavaClass toastClass = new AndroidJavaClass("android.widget.Toast");

			//object[] toastParams = new object[3];

			//AndroidJavaClass unityActivity = new AndroidJavaClass("com.unity3d.player.UnityPlayer");

			//toastParams[0] = unityActivity.GetStatic<AndroidJavaObject>("currentActivity");
			//toastParams[1] = text;
			//toastParams[2] = toastClass.GetStatic<int>("LENGTH_SHORT");

			//AndroidJavaObject toastObject = toastClass.CallStatic<AndroidJavaObject>("makeText", toastParams);
			//toastObject.Call("show");

			var unityPlayerClass = new AndroidJavaClass("com.unity3d.player.UnityPlayer");

			var context = unityPlayerClass.GetStatic<AndroidJavaObject>("currentActivity");

			var wifiManager = context.Call<AndroidJavaObject>("getSystemService", "wifi");

			var info = wifiManager.Call<AndroidJavaObject>("getConnectionInfo");

			int dbmval = info.Call<int>("getRssi");
			int spd = info.Call<int>("getLinkSpeed");

			dbm.text = dbmval + "dBm";
			speed.text = spd + "Mbps";

			dbm_slider.value = dbmval;
			speed_slider.value = spd;

			if (dbmval < -70)
				dbm_fill.color = red;
			else if (dbmval < -50)
				dbm_fill.color = orange;
			else if (dbmval < -30)
				dbm_fill.color = blue;
			else
				dbm_fill.color = green;

			if (spd < 20)
				speed_fill.color = red;
			else if (spd < 30)
				speed_fill.color = orange;
			else if (spd < 80)
				speed_fill.color = blue;
			else
				speed_fill.color = green;
		}
	}
}
