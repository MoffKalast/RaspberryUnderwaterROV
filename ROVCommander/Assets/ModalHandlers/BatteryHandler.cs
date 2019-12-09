using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using System;

public class BatteryHandler : MonoBehaviour
{
	public Text status;
    public Text typetext;

    private SocketIOScript socket;

    private void Start()
    {
        socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();

        SettingsUpdate();
    }

    public void SettingsUpdate()
    {
        typetext.text = socket.settings.battery;
    }

        void Update()
	{
		if (socket.livedata != null){
			status.text = "Status: " + socket.livedata.voltage + " V";
		}
	}
}
