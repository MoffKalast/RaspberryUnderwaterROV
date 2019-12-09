using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using System;

public class ConnectionHandler : MonoBehaviour {

	public Text status;
	public Text telemetrystatus;
	public Text placeholder;
	public Text IPaddress;

	void Update () {

		SocketIOScript sockets = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();

		if (sockets != null)
		{
			status.text = "Status: " + sockets.status;
			telemetrystatus.text = "Telemetry: " + ((sockets.livedata != null)? ("Received: "+ ((DateTime.Now.Ticks - sockets.lastTelemetryTime)/ 1e7).ToString("##0.0") + " seconds ago") : "Null");
			placeholder.text = sockets.serverURL;
		}
	}
}
