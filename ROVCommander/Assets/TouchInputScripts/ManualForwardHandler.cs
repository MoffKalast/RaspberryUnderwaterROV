using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

public class ManualForwardHandler : MonoBehaviour, IEndDragHandler {

	public Slider left;
	public Slider right;

	private SocketIOScript socket;

	void Start () {

		socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();
	}

	public void SliderChanged()
	{
		socket.SetForwardMotorsSpeed((int)right.value, (int)left.value);
	}

	public void OnEndDrag(PointerEventData eventData)
	{
		Debug.Log("EndDrag");
		left.value = 0;
		right.value = 0;
		socket.SetForwardMotorsSpeed((int)right.value, (int)left.value);
	}
}
