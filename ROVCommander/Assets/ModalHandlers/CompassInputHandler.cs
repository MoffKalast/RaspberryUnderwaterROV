using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using System;

public class CompassInputHandler : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler{

	public GameObject scroll;

	private float wid;

	private bool preview = false;
	private int TGTdegrees = 0;

	private float degrees = 0;

	private Renderer rend;
	private SocketIOScript socket;
	private ControlManagerScript ctrlmgr;

	void Start()
	{
		wid = (float)Screen.width;

		rend = scroll.GetComponent<Renderer>();
		socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();
		ctrlmgr = GameObject.Find("Controls").GetComponent<ControlManagerScript>();
	}

	public void OnBeginDrag(PointerEventData eventData)
	{
		if (socket.settings.autoHeading)
			TGTdegrees = socket.settings.tgtHeading;
		else if (socket.livedata != null)
			TGTdegrees = socket.livedata.heading;
		else
			TGTdegrees = 0;

		preview = true;
	}

	public void OnDrag(PointerEventData eventData)
	{
		TGTdegrees += (int)((eventData.delta.x / wid) * 450);

		if (TGTdegrees > 180)
			TGTdegrees -= 360;
		else if (TGTdegrees < -180)
			TGTdegrees += 360;
	}

	public void OnEndDrag(PointerEventData eventData)
	{
		ctrlmgr.DriveAuto(TGTdegrees);
		preview = false;
	}

	void Update()
	{
		if (socket.livedata != null)
        {
            float liveheading = socket.livedata.heading;

            if (liveheading < 0)
                liveheading += 360;
            else if (liveheading > 360)
                liveheading -= 360;

            if (Math.Abs(degrees - liveheading) > 10)
            {
                float change = 0;
                float diff = (degrees - liveheading) % 360f;
                if (diff < 0)
                    change = 2;
                else
                    change = -2;

                if (Math.Abs(diff) > 180)
                    change = 0 - change;

                degrees += change;

                if (degrees < 0)
                    degrees += 360;
                else if (degrees > 360)
                    degrees -= 360;
            }
            else
                degrees = degrees*0.8f + liveheading*0.2f;

            Debug.Log(liveheading + " , " + degrees);
        }

		if (preview)
		{
			float tgtoffset = ((float)TGTdegrees) / 360f;
			rend.material.SetFloat("_Target", tgtoffset);
			rend.material.SetFloat("_TargetAlpha", 1.0f);
		}
		else if (socket.livedata != null)
		{
			if (socket.settings.autoHeading){
				float tgtoffset = ((float)socket.settings.tgtHeading) / 360f;
				rend.material.SetFloat("_Target", tgtoffset);
				rend.material.SetFloat("_TargetAlpha", 1.0f);
			}else{
				rend.material.SetFloat("_TargetAlpha", 0.0f);
			}

		}

		float offset = ((float)degrees) / 360f;
		rend.material.SetFloat("_Offset", -offset);
	}
}