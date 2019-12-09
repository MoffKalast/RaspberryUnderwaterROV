using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using UnityEngine;
using System;

public class WindowScript : MonoBehaviour {

    public GameObject connect, motors, battery, camera, terminal;

    private bool connect_open = false;
    private bool motors_open = false;
	private bool battery_open = false;
    private bool camera_open = false;
    private bool terminal_open = false;

    public void ToggleTerminal()
    {
        if (terminal_open)
            closeAll();
        else
        {
            closeAll();
            terminal_open = true;
            terminal.SetActive(true);
        }
    }

    public void ToggleConnect()
    {
        if (connect_open)
            closeAll();
        else
        {
            closeAll();
            connect_open = true;
            connect.SetActive(true);
        }
    }

    public void ToggleCamera()
    {
        if (camera_open)
            closeAll();
        else
        {
            closeAll();
            camera_open = true;
            camera.SetActive(true);
        }
    }

    public void ToggleMotors()
    {
		if (motors_open)
			closeAll();
		else
		{
			closeAll();
			motors_open = true;
			motors.SetActive(true);
		}
    }

	public void ToggleBattery()
	{
		if (battery_open)
			closeAll();
		else
		{
			closeAll();
			battery_open = true;
			battery.SetActive(true);
		}
	}

	void closeAll()
    {
        connect.SetActive(false);
        connect_open = false;

        motors.SetActive(false);
        motors_open = false;

		battery.SetActive(false);
		battery_open = false;

        camera.SetActive(false);
        camera_open = false;

        terminal.SetActive(false);
        terminal_open = false;
    }
}
