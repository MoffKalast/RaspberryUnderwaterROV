using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using System;

public class DepthInputHandler : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler
{
	public GameObject scroll;

	public Text depthinfo;
    public Text depthtgtinfo;

    private float hei;

    private bool preview = false;
	private float TGTdepth = 0;

	private float meters = 0;

	private Renderer rend;
	private SocketIOScript socket;
    private ControlManagerScript ctrlmgr;

    void Start()
	{
        hei = (float)Screen.height;

        rend = scroll.GetComponent<Renderer>();
		socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();
        ctrlmgr = GameObject.Find("Controls").GetComponent<ControlManagerScript>();
    }

    public void OnBeginDrag(PointerEventData eventData)
    {
        if (!socket.settings.autoDepth)
            return;

        TGTdepth = socket.settings.tgtDepth;
        preview = true;
    }

    public void OnDrag(PointerEventData eventData)
    {
        if (!socket.settings.autoDepth)
            return;

        TGTdepth -= (eventData.delta.y / hei) * 7.5f;

        if (TGTdepth < 0)
            TGTdepth = 0;
        else if (TGTdepth > 30)
            TGTdepth = 30;
    }

    public void OnEndDrag(PointerEventData eventData)
    {
        if (!socket.settings.autoDepth)
            return;

        ctrlmgr.DepthAuto(TGTdepth);
        preview = false;
    }

    void Update()
	{
        if (socket.livedata != null)
		{
			depthinfo.text = socket.livedata.depth.ToString("#0.0")+"m";
            meters = meters * 0.8f + socket.livedata.depth * 0.2f;
		}
		else{
			depthinfo.text = meters.ToString("#0.0") + "m";
        }

		if (preview)
		{
			float tgtoffset = TGTdepth / 30f;
			rend.material.SetFloat("_Target", -tgtoffset);
			rend.material.SetFloat("_TargetAlpha", 1.0f);

            depthtgtinfo.text = TGTdepth.ToString("#0.0") + "m";
        }
		else if (socket.livedata != null)
		{
			if (socket.settings.autoDepth)
			{
				float tgtoffset = socket.settings.tgtDepth / 30f;
				rend.material.SetFloat("_Target", -tgtoffset);
				rend.material.SetFloat("_TargetAlpha", 1.0f);
			}
			else
			{
				rend.material.SetFloat("_TargetAlpha", 0.0f);
			}

            depthtgtinfo.text = socket.settings.tgtDepth.ToString("#0.0") + "m";
        }

		float offset = (meters - 1f) / 30f;
		rend.material.SetFloat("_Offset", offset);
	}
}
