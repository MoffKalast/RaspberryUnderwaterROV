using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class RovCfgHandler : MonoBehaviour {

    //https://www.fierceelectronics.com/components/compensating-for-tilt-hard-iron-and-soft-iron-effects

    private SocketIOScript socket;

    public Text generalMultStatus;

    public Text rightDepthMultStatus;
    public Text leftDepthMultStatus;

    public Text rightMultStatus;
    public Text leftMultStatus;

    public Text waterType;

    public Text depth_offset;

    public GameObject heading_P;
	public GameObject depth_P;
    public GameObject balance_P;

    void Start () {
		socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();
        SettingsUpdate();
    }

    public void SettingsUpdate()
    {
        Settings settings = socket.settings;

        generalMultStatus.text = settings.general_mult + "%";

        rightDepthMultStatus.text = (settings.right_depth_invert ? "-" : "+") + settings.right_depth_mult + "%";
        leftDepthMultStatus.text = (settings.left_depth_invert ? "-" : "+") + settings.left_depth_mult + "%";

        rightMultStatus.text = (settings.right_invert ? "-" : "+") + settings.right_mult + "%";
        leftMultStatus.text = (settings.left_invert ? "-" : "+") + settings.left_mult + "%";

        waterType.text = settings.water_type;
        depth_offset.text = "Offset: " + settings.depth_offset + " m";

        SetSliders(settings);
    }

    public void SetWaterType()
    {
        Debug.Log(waterType.text);
        socket.SetWaterType(waterType.text);
    }
	
	public void SetSliders(Settings settings)
	{
		SetSliderValue("Heading: ", heading_P, settings.heading_P);
		SetSliderValue("Depth:     ", depth_P, settings.depth_P);
        SetSliderValue("Balance:  ", balance_P, settings.balance_P);
    }

	void SetSliderValue(string start, GameObject pidnode, float value)
	{
		string type = pidnode.transform.parent.name;
		GetSlider(pidnode).value = value;

		Text text = pidnode.GetComponent<Text>();
		text.text = start + value.ToString("#0.00");
	}

	Slider GetSlider(GameObject pidnode){
		return pidnode.transform.GetChild(0).gameObject.GetComponent<Slider>();
	}

	public void UpdateP(string controller)
	{
		if(string.Equals(controller, "heading")) {
			socket.SetHeadingP(GetSlider(heading_P).value);
		} else if (string.Equals(controller, "depth")) {
			socket.SetDepthP(GetSlider(depth_P).value);
		} else if (string.Equals(controller, "balance")) {
            socket.SetBalanceP(GetSlider(balance_P).value);
        }
    }
}
