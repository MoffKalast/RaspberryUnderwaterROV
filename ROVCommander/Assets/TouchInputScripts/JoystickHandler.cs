using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using System;

public class JoystickHandler : MonoBehaviour, IDragHandler, IEndDragHandler
{
	public GameObject stick;

	public bool resetPosition = true;

	private RectTransform center;
	private RectTransform move;

	private SocketIOScript socket;

	void Start ()
	{
		center = GetComponent<RectTransform>();
		move = stick.GetComponent<RectTransform>();
		move.anchoredPosition = new Vector2(0, 0);
		socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();
	}

	//https://www.impulseadventure.com/elec/robot-differential-steering.html

	private float fPivYLimit = 20f;

	void DifferentialDrive(float x, float y)
	{
		float nMotPremixL = 0;  // Motor (left)  premixed output        (-70..+70)
		float nMotPremixR = 0;  // Motor (right) premixed output        (-70..+70)

		nMotPremixL = (x >= 0) ? 70f : (70f + x);
		nMotPremixR = (x >= 0) ? (70f - x) : 70f;

		// Scale Drive output due to Joystick Y input (throttle)
		nMotPremixL = nMotPremixL * y / 70f;
		nMotPremixR = nMotPremixR * y / 70f;

		// Now calculate pivot amount
		// - Strength of pivot (nPivSpeed) based on Joystick X input
		// - Blending of pivot vs drive (fPivScale) based on Joystick Y input
		float nPivSpeed = x;
		float fPivScale = (Mathf.Abs(y) > fPivYLimit) ? 0f : (1f - Mathf.Abs(y) / fPivYLimit);

		// Calculate final mix of Drive and Pivot
		float nMotMixL = ((1f - fPivScale) * nMotPremixL + fPivScale * (nPivSpeed))/70f;
		float nMotMixR = ((1f - fPivScale) * nMotPremixR + fPivScale * (-nPivSpeed))/70f;

		int left = (int)Mathf.Round(nMotMixL*100f);
		int right = (int)Mathf.Round(nMotMixR*100f);

		socket.SetForwardMotorsSpeed(right, left);
	}

	public void OnDrag(PointerEventData eventData)
	{
		float deltax = eventData.position.x - center.position.x;
		float deltay = eventData.position.y - center.position.y;
		float dist = Mathf.Sqrt(deltax * deltax + deltay * deltay);

		if(dist > 70){
			deltax /= dist;
			deltay /= dist;

			deltax *= 70;
			deltay *= 70;
		}

		move.anchoredPosition = new Vector2(deltax, deltay);
		DifferentialDrive(deltax, deltay);
	}

	public void OnEndDrag(PointerEventData eventData)
	{
		if (resetPosition){
			move.anchoredPosition = new Vector2(0, 0);
			DifferentialDrive(0, 0);
		}
	}
}
