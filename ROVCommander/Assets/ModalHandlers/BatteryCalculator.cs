using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using UnityEngine;
using System;

public class BatteryCalculator : MonoBehaviour {

    public Text percentage;
    public Slider indicator;
    public Image fill;

    private Color red = new Color(0.87f, 0.18f, 0f, 1f);
    private Color orange = new Color(0.95f, 0.65f, 0f, 1f);
    private Color green = new Color(0f, 0.77f, 0.07f, 1f);

    private SocketIOScript socket;

    private float smoothcapacity = 0;

    private void Start()
    {
        socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();
    }

    private float LiPoCapacity(float voltage, float cells)
    {
        return (1000f / (7f * cells)) * voltage - 500;
    }

    void Update () {

        if (socket.livedata != null)
        {
            float voltage = socket.livedata.voltage;
            float throttle = Mathf.Abs(socket.livedata.left_depth_speed) + Mathf.Abs(socket.livedata.right_depth_speed) + Mathf.Abs(socket.livedata.left_speed) + Mathf.Abs(socket.livedata.right_speed);

            if (throttle > 100)
                return;

            if (string.Equals(socket.settings.battery, "SLA AGM 12V"))
            {
                float sqrV = voltage * voltage;
                float capacity = -2272841f + 730530.5f * voltage - 88048.3f * sqrV + 4715.909f * sqrV*voltage - 94.69697f * sqrV*sqrV;
                SetUI(capacity);
            }
			else if (string.Equals(socket.settings.battery, "LiPo 2S"))
			{
				SetUI(LiPoCapacity(voltage, 2));
			}
            else if (string.Equals(socket.settings.battery, "LiPo 3S"))
            {
                SetUI(LiPoCapacity(voltage, 3));
            }
            else if (string.Equals(socket.settings.battery, "LiPo 4S"))
            {
                SetUI(LiPoCapacity(voltage, 4));
            }
        }
    }

    void SetUI(float rawlevel)
    {
        rawlevel = Clamp(rawlevel, 0f, 100f);

        if (smoothcapacity <= 0)
            smoothcapacity = rawlevel;
        else
            smoothcapacity = rawlevel * 0.05f + rawlevel * 0.95f;

        int level = (int) Math.Round(smoothcapacity);

        percentage.text = level + "%";
        indicator.value = level;

        if (level > 66)
            fill.color = green;
        else if (level > 33)
            fill.color = orange;
        else
            fill.color = red;
    }

    float Clamp(float val, float min, float max)
    {
        if (val > max)
            return max;
        if (val < min)
            return min;
        return val;
    }


}
