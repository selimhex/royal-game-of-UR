<script>
  export let rolledNum = 0;
  export let key = null;
</script>

<svg
  width="100"
  height="100"
  viewBox="0 0 100 77"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  >
  <g id="Dice-1-000">
    <g id="black-dice">
      <path id="Dice-tri" d="M50 0L93.3013 75H6.69873L50 0Z" fill="#0B0B0B" />
      <g id="black-hi">
        <path d="M50 0V50L6.69873 75L50 0Z" fill="black" />
        <path d="M50 0V50L6.69873 75L50 0Z" fill="url(#paint0_linear)" />
      </g>
      <g id="black-low">
        <path d="M50 0L93.3013 75L50 50V0Z" fill="#222222" />
        <path
          d="M50 0L93.3013 75L50 50V0Z"
          fill="url(#paint1_linear)"
          fill-opacity="0.6" />
      </g>
    </g>
    {#if !!rolledNum && rolledNum === 1}
      <g id="white-top">
        <g id="white-Dice-tri">
          <path d="M50 35L62.9904 57.5H37.0096L50 35Z" fill="#7D7D7D" />
          <path
            d="M50 35L62.9904 57.5H37.0096L50 35Z"
            fill="url(#paint2_linear)" />
        </g>
        <g id="white-hi">
          <path d="M50 35V50L37.0096 57.5L50 35Z" fill="#F4F4F4" />
          <path d="M50 35V50L37.0096 57.5L50 35Z" fill="url(#paint3_linear)" />
        </g>
        <g id="white-low">
          <path d="M50 35L62.9904 57.5L50 50V35Z" fill="#B9B9B9" />
          <path d="M50 35L62.9904 57.5L50 50V35Z" fill="url(#paint4_linear)" />
        </g>
      </g>
    {/if}
  </g>
  <defs>
    <linearGradient
      id="paint0_linear"
      x1="-3.5"
      y1="-13"
      x2="92"
      y2="75"
      gradientUnits="userSpaceOnUse">
      <stop stop-color="white" />
      <stop offset="0.677083" stop-color="white" stop-opacity="0" />
    </linearGradient>
    <linearGradient
      id="paint1_linear"
      x1="39.8013"
      y1="-13"
      x2="135.301"
      y2="75"
      gradientUnits="userSpaceOnUse">
      <stop stop-color="white" />
      <stop offset="0.304651" stop-color="white" stop-opacity="0" />
    </linearGradient>
    <linearGradient
      id="paint2_linear"
      x1="50"
      y1="35"
      x2="50"
      y2="65"
      gradientUnits="userSpaceOnUse">
      <stop stop-color="white" />
      <stop offset="1" stop-color="white" stop-opacity="0" />
    </linearGradient>
    <linearGradient
      id="paint3_linear"
      x1="43.5048"
      y1="35"
      x2="43.5048"
      y2="57.5"
      gradientUnits="userSpaceOnUse">
      <stop stop-color="white" />
      <stop offset="1" stop-color="white" stop-opacity="0" />
    </linearGradient>
    <linearGradient
      id="paint4_linear"
      x1="56.4952"
      y1="35"
      x2="56.4952"
      y2="57.5"
      gradientUnits="userSpaceOnUse">
      <stop stop-color="white" />
      <stop offset="1" stop-color="white" stop-opacity="0" />
    </linearGradient>
  </defs>
</svg>
