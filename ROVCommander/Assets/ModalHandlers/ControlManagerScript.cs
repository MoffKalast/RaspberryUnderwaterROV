using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ControlManagerScript : MonoBehaviour {

	enum DepthMode {
		Manual,
		Auto
	};

	enum DriveMode {
		Joystick,
		Auto,
		Manual,
	};

	private DriveMode drivemode = DriveMode.Joystick;
	private DepthMode depthmode = DepthMode.Manual;

	public GameObject forward_joystick;
	public Slider forward_linear;
	public GameObject forward_manual;

	public Slider depth_manual;
	public GameObject depth_selector;

	private SocketIOScript socket;

	void Start () {

		socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();
	}

	public void NextDriveMode()
	{
		switch (drivemode){
			case DriveMode.Joystick: DriveAuto((socket.livedata != null)? socket.livedata.heading : 0); break;
			case DriveMode.Auto: DriveManual(); break;
			case DriveMode.Manual: DriveJoystick(); break;
		}
	}

	public void NextDepthMode()
	{
		switch (depthmode){
			case DepthMode.Manual: DepthAuto((socket.livedata != null) ? socket.livedata.depth : 0); break;
			case DepthMode.Auto: DepthManual(); break;
		}
	}

	// Drive Switcher

	public void DriveJoystick()
	{
		forward_joystick.SetActive(true);
		forward_linear.gameObject.SetActive(false);
		forward_manual.SetActive(false);

		socket.SetAutoHeading(false, 0);
		socket.SetForwardMotorsSpeed(0, 0);

		drivemode = DriveMode.Joystick;
	}

	public void DriveManual()
	{
		forward_joystick.SetActive(false);
		forward_linear.gameObject.SetActive(false);
		forward_manual.SetActive(true);

		socket.SetAutoHeading(false, 0);
		socket.SetForwardMotorsSpeed(0, 0);

		drivemode = DriveMode.Manual;
	}

	public void DriveAuto(int heading)
	{
		forward_joystick.SetActive(false);
		forward_linear.gameObject.SetActive(true);
		forward_manual.SetActive(false);

		socket.SetForwardMotorsSpeed(0, 0);
		socket.SetAutoHeading(true, heading);

		drivemode = DriveMode.Auto;
	}

	// Depth Switcher

	public void DepthAuto(float depth)
	{
		depth_manual.gameObject.SetActive(false);

		socket.SetDepthMotorsSpeed(0,0);
		socket.SetAutoDepth(true, depth);

		depthmode = DepthMode.Auto;
	}

	public void DepthManual()
	{
		depth_manual.gameObject.SetActive(true);

		socket.SetDepthMotorsSpeed(0,0);
		socket.SetAutoDepth(false, 0);

		depthmode = DepthMode.Manual;
	}
}
