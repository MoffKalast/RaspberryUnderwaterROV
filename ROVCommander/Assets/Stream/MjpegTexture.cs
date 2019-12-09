using UnityEngine;
using System;
using UnityEngine.UI;

public class MjpegTexture : MonoBehaviour
{
    public string streamAddress;
    public int chunkSize = 32; //kB

    public Texture2D nosignal;

    Texture2D tex;

    const int initWidth = 800;
    const int initHeight = 600;

    bool updateFrame = false;

    MjpegProcessor mjpeg;

    float deltaTime = 0.0f;
    float mjpegDeltaTime = 0.0f;

    bool updateResolution = false;

    RectTransform rect;

    SocketIOScript socket;

    public void Start()
    {
        mjpeg = new MjpegProcessor(chunkSize * 1024);
        mjpeg.FrameReady += OnMjpegFrameReady;
        mjpeg.Error += OnMjpegError;
        Uri mjpegAddress = new Uri(streamAddress);
        mjpeg.ParseStream(mjpegAddress);

        // Create a 16x16 texture with PVRTC RGBA4 format
        // and will it with raw PVRTC bytes.
        tex = new Texture2D(initWidth, initHeight, TextureFormat.PVRTC_RGBA4, false);

        rect = gameObject.GetComponent<RectTransform>();

        socket = GameObject.Find("SocketIO").GetComponent<SocketIOScript>();

        Resize();

        GetComponent<CanvasRenderer>().SetTexture(nosignal);
    }

    public void StartStream(string address)
    {
        Uri mjpegAddress = new Uri(address);
        mjpeg.ParseStream(mjpegAddress);

        updateResolution = true;
    }

    public void Resize()
    {
        updateResolution = false;

        string[] axes = socket.settings.stream_res.Split('x');

        float wid = float.Parse(axes[0]);
        float hei = float.Parse(axes[1]);

        float aspect = wid / hei;

        //1.0x1.0 == 1024x640

        float corrector = ((float)Screen.height) / ((float)Screen.width);

        rect.localScale = new Vector3(aspect * corrector, 1.0f, 1.0f);
    }

    private void OnMjpegFrameReady(object sender, FrameReadyEventArgs e)
    {
        updateFrame = true;
    }

    void OnMjpegError(object sender, ErrorEventArgs e)
    {
        Debug.Log("Error received while reading the MJPEG.");
    }
    
    void Update()
    {
        deltaTime += Time.deltaTime;

        if (updateFrame)
        {
            if (updateResolution)
                Resize();

            tex.LoadImage(mjpeg.CurrentFrame);
            tex.Apply();

            GetComponent<CanvasRenderer>().SetTexture(tex);
            updateFrame = false;

            mjpegDeltaTime += (deltaTime - mjpegDeltaTime) * 0.2f;

            deltaTime = 0.0f;
        }
    }

    void OnDestroy()
    {
        mjpeg.StopStream();
    }
}