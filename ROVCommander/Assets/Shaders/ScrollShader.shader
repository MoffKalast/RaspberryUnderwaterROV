Shader "Custom/ScrollShader"
{
	Properties
	{
		_MainTex ("Texture", 2D) = "white" {}
		_OverlayTex("Texture", 2D) = "white" {}
		_Offset ("Offset", Float) = 0.0
		_Target("Target", Float) = 0.0
		_TargetAlpha("TargetAlpha", Float) = 0.0
	}
	SubShader
	{
		Tags {"Queue" = "Transparent" "IgnoreProjector" = "True" "RenderType" = "Transparent"}
		ZWrite Off
		Blend SrcAlpha OneMinusSrcAlpha
		LOD 100

		Pass
		{
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			
			#include "UnityCG.cginc"

			struct appdata
			{
				float4 vertex : POSITION;
				float2 uv : TEXCOORD0;
			};

			struct v2f
			{
				float2 uv : TEXCOORD0;
				UNITY_FOG_COORDS(1)
				float4 vertex : SV_POSITION;
			};

			sampler2D _MainTex;
			sampler2D _OverlayTex;

			float _Offset;
			float _Target;
			float _TargetAlpha;

			float4 _MainTex_ST;
			
			v2f vert (appdata v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.uv = TRANSFORM_TEX(v.uv, _MainTex);
				UNITY_TRANSFER_FOG(o,o.vertex);
				return o;
			}
			
			fixed4 frag (v2f i) : SV_Target
			{
				fixed4 col = tex2D(_MainTex, i.uv + float2(_Offset, 0.0));
				fixed4 tgt = tex2D(_OverlayTex, i.uv + float2(_Offset+_Target, 0.0));

				float mult = _TargetAlpha * tgt.a;

				col.r = col.r * (1.0 - mult) + tgt.r * mult;
				col.g = col.g * (1.0 - mult) + tgt.g * mult;
				col.b = col.b * (1.0 - mult) + tgt.b * mult;
				col.a = max(col.a, mult);

				return col;
			}
			ENDCG
		}
	}
}
