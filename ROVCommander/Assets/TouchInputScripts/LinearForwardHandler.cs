using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class LinearForwardHandler : MonoBehaviour, IEndDragHandler{

	public Slider slider;

	private SocketIOScript socket;

	void Start () {

		socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();
	}

	public void SliderChanged()
	{
		socket.SetForwardMotorsSpeed((int)slider.value, (int)slider.value);
	}

	public void OnEndDrag(PointerEventData eventData)
	{
		slider.value = 0;
		socket.SetForwardMotorsSpeed((int)slider.value, (int)slider.value);
	}
}
