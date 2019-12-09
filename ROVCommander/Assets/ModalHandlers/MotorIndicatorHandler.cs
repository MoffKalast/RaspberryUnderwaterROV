using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class MotorIndicatorHandler : MonoBehaviour {

	public Image left_image;
	public Image right_image;

	public Image hover_left_image;
	public Image hover_right_image;

	public Text left_text;
	public Text right_text;

    public Text left_depth_text;
    public Text right_depth_text;

    private RectTransform left;
	private RectTransform right;

	private RectTransform depth_left;
	private RectTransform depth_right;

	private SocketIOScript socket;

	private Color red = new Color(1f, 0.5f, 0.5f, 1f);
	private Color green = new Color(0.5f, 1f, 0.5f, 1f);
	private Color white = new Color(1f, 1f, 1f, 1f);

	void Start () {

		socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();

		left = left_image.GetComponent<RectTransform>();
		right = right_image.GetComponent<RectTransform>();

        depth_left = hover_left_image.GetComponent<RectTransform>();
        depth_right = hover_right_image.GetComponent<RectTransform>();
	}

	void Update () {
		
		if(socket.livedata != null)
		{
			float rightdepthspeed = socket.livedata.right_depth_speed * (socket.settings.right_depth_invert ? -1f: 1f);
            float leftdepthspeed = socket.livedata.left_depth_speed * (socket.settings.left_depth_invert ? -1f : 1f);

            float leftspeed = socket.livedata.left_speed * (socket.settings.left_invert ? -1f : 1f);
			float rightspeed = socket.livedata.right_speed * (socket.settings.right_invert ? -1f : 1f);

			left.Rotate(new Vector3(0, 0, ((float)leftspeed) / 4f));
			right.Rotate(new Vector3(0, 0, ((float)-rightspeed) / 4f));

            depth_left.Rotate(new Vector3(0, 0, ((float)leftdepthspeed) / 4f));
            depth_right.Rotate(new Vector3(0, 0, ((float)-rightdepthspeed) / 4f));

			left_text.text = "L: "+ leftspeed + "%";
			right_text.text = "R: " + rightspeed + "%";

            left_depth_text.text = "dL: " + leftdepthspeed + "%";
            right_depth_text.text = "dR: " + rightdepthspeed + "%";

            if (Mathf.Abs(leftdepthspeed) < 0.01f) {
                hover_left_image.color = white;
            }else if (leftdepthspeed > 0){
                hover_left_image.color = green;
            }else{
                hover_left_image.color = red;
            }

            if (Mathf.Abs(rightdepthspeed) < 0.01f){
                hover_right_image.color = white;
            }else if (rightdepthspeed > 0){
                hover_right_image.color = green;
            }else{
                hover_right_image.color = red;
            }

            if (Mathf.Abs(leftspeed) < 0.01f){
				left_image.color = white;
			}else if (leftspeed > 0){
				left_image.color = green;
			}else{
				left_image.color = red;
			}

			if (Mathf.Abs(rightspeed) < 0.01f){
				right_image.color = white;
			}else if (rightspeed > 0){
				right_image.color = green;
			}else{
				right_image.color = red;
			}

		}

	}
}
