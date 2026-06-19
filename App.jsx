import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ============================================================
// THEME
// ============================================================
const THEME = {
  dark: { bg:"#08090b", panel:"#17181b", panel2:"#222326", border:"rgba(255,255,255,0.10)", text:"#f4f4f5", textSec:"#a1a1aa", wire:"#e2e8f0", particle:"#38bdf8", accent:"#3b82f6", success:"#22c55e", warning:"#f59e0b", error:"#ef4444", gridLine:"rgba(255,255,255,0.06)" },
  light: { bg:"#f1f5f9", panel:"#ffffff", panel2:"#f8fafc", border:"rgba(0,0,0,0.10)", text:"#0f172a", textSec:"#64748b", wire:"#1e293b", particle:"#2563eb", accent:"#2563eb", success:"#16a34a", warning:"#d97706", error:"#dc2626", gridLine:"rgba(0,0,0,0.06)" },
};

// ============================================================
// CIRCUIT DATA
// ============================================================
const CATEGORIES = [
  { id:"dc", name:"DC Circuits", icon:"⚡" },
  { id:"laws", name:"Circuit Laws", icon:"📐" },
  { id:"capacitor", name:"Capacitors", icon:"⊣" },
  { id:"inductor", name:"Inductors", icon:"∿" },
  { id:"ac", name:"AC & RLC", icon:"〜" },
  { id:"diodes", name:"Diodes & Electronics", icon:"▷" },
  { id:"practical", name:"Practical Devices", icon:"🔧" },
];

const CIRCUITS = [
  {id:1,cat:"dc",name:"Simple Resistor",template:"basic_series",params:{V:12,R1:6},desc:"One resistor, one battery. I = V/R."},
  {id:2,cat:"dc",name:"Open Circuit",template:"open_circuit",params:{V:12},desc:"No complete path — zero current despite voltage."},
  {id:3,cat:"dc",name:"Closed Circuit",template:"switch_bulb",params:{V:9,R1:45,sw:true},desc:"Switch closed: current flows, bulb lights."},
  {id:4,cat:"dc",name:"Short Circuit",template:"short_circuit",params:{V:12,r:0.5},desc:"Near-zero path resistance → dangerous high current."},
  {id:5,cat:"dc",name:"Single Bulb",template:"single_bulb",params:{V:6,R1:30},desc:"Bulb brightness set by I²R power dissipation."},
  {id:6,cat:"dc",name:"Switch-Controlled Bulb",template:"switch_bulb",params:{V:9,R1:45,sw:false},desc:"Click switch to toggle current and brightness."},
  {id:7,cat:"dc",name:"Two Bulbs Series",template:"series_bulbs",params:{V:12,R1:30,R2:30},desc:"Same current; voltage splits between bulbs."},
  {id:8,cat:"dc",name:"Two Bulbs Parallel",template:"parallel_bulbs",params:{V:12,R1:30,R2:30},desc:"Both get full voltage; independent currents."},
  {id:9,cat:"dc",name:"Three Resistors Series",template:"series3",params:{V:12,R1:4,R2:4,R3:4},desc:"Rtotal = R1+R2+R3; same current, voltages add."},
  {id:10,cat:"dc",name:"Three Resistors Parallel",template:"parallel3",params:{V:12,R1:8,R2:8,R3:8},desc:"Same voltage; currents add; Rtotal < any branch."},
  {id:11,cat:"dc",name:"Mixed Series-Parallel",template:"mixed_sp",params:{V:12,R1:4,R2:6,R3:6},desc:"R2‖R3 in parallel, then in series with R1."},
  {id:12,cat:"dc",name:"Variable Resistor",template:"basic_series",params:{V:12,R1:20},desc:"Adjust R to see I change inversely."},
  {id:13,cat:"dc",name:"Rheostat Circuit",template:"rheostat",params:{V:12,R1:20,Rvar:10},desc:"Fixed + variable resistor control current."},
  {id:14,cat:"dc",name:"Potentiometer",template:"voltage_divider",params:{V:12,R1:50,R2:50},desc:"Wiper position determines output fraction."},
  {id:15,cat:"dc",name:"Voltage Divider",template:"voltage_divider",params:{V:12,R1:6,R2:6},desc:"Vout = V×R2/(R1+R2)."},
  {id:16,cat:"dc",name:"Current Divider",template:"parallel_bulbs",params:{V:12,R1:4,R2:6},desc:"Parallel branches split current inversely with R."},
  {id:17,cat:"dc",name:"Batteries in Series",template:"batteries_series",params:{V1:6,V2:6,V3:6,R1:9},desc:"EMFs add: Vtotal = V1+V2+V3."},
  {id:18,cat:"dc",name:"Batteries in Parallel",template:"batteries_parallel",params:{V1:6,V2:6,R1:3},desc:"Same voltage, shared current load."},
  {id:19,cat:"dc",name:"Opposing Batteries",template:"opposing_batteries",params:{V1:9,V2:6,R1:3},desc:"Net EMF = V1−V2; direction set by larger."},
  {id:20,cat:"dc",name:"Battery Internal Resistance",template:"internal_r",params:{emf:12,r:1,R1:11},desc:"Vterminal = EMF − Ir; drops under load."},
  {id:21,cat:"laws",name:"Ohm's Law",template:"basic_series",params:{V:12,R1:6},desc:"I = V/R. Linear relationship between V and I."},
  {id:22,cat:"laws",name:"Kirchhoff's Current Law",template:"parallel3",params:{V:12,R1:6,R2:4,R3:12},desc:"ΣI_in = ΣI_out at every node."},
  {id:23,cat:"laws",name:"Kirchhoff's Voltage Law",template:"series3",params:{V:12,R1:3,R2:5,R3:4},desc:"ΣV around any loop = 0."},
  {id:24,cat:"laws",name:"Junction Current Splitting",template:"parallel_bulbs",params:{V:12,R1:4,R2:8},desc:"Current splits at node; lower R gets more."},
  {id:25,cat:"laws",name:"Two-Loop KVL",template:"series3",params:{V:12,R1:4,R2:2,R3:3},desc:"Two mesh loops solved simultaneously."},
  {id:26,cat:"laws",name:"Three-Branch Network",template:"parallel3",params:{V:15,R1:5,R2:10,R3:15},desc:"Three branches, different resistances."},
  {id:27,cat:"laws",name:"Wheatstone Bridge",template:"wheatstone",params:{V:10,R1:100,R2:100,R3:100,R4:100},desc:"Four-resistor diamond; null detector at balance."},
  {id:28,cat:"laws",name:"Balanced Bridge",template:"wheatstone",params:{V:10,R1:100,R2:200,R3:100,R4:200},desc:"R1/R2=R3/R4 → galvanometer reads zero."},
  {id:29,cat:"laws",name:"Unbalanced Bridge",template:"wheatstone",params:{V:10,R1:100,R2:200,R3:150,R4:200},desc:"Bridge unbalanced → galvanometer deflects."},
  {id:30,cat:"laws",name:"Meter Bridge",template:"wheatstone",params:{V:6,R1:20,R2:100,R3:30,R4:100},desc:"Wire bridge finds unknown R via balance ratio."},
  {id:31,cat:"capacitor",name:"Capacitor Charging",template:"cap_charge",params:{V:12,R1:10,C:100},desc:"Vc rises exponentially; I decays. τ = RC."},
  {id:32,cat:"capacitor",name:"Capacitor Discharging",template:"cap_discharge",params:{V0:12,R1:10,C:100},desc:"Vc falls exponentially; energy lost as heat."},
  {id:33,cat:"capacitor",name:"RC Charging",template:"cap_charge",params:{V:9,R1:22,C:220},desc:"At t=τ, capacitor reaches 63.2% of supply."},
  {id:34,cat:"capacitor",name:"RC Discharging",template:"cap_discharge",params:{V0:9,R1:22,C:220},desc:"At t=τ, voltage falls to 36.8% of initial."},
  {id:35,cat:"capacitor",name:"Capacitors in Series",template:"caps_series",params:{V:12,C1:100,C2:100,C3:100},desc:"1/Ctotal = 1/C1+1/C2+1/C3; same charge Q."},
  {id:36,cat:"capacitor",name:"Capacitors in Parallel",template:"caps_parallel",params:{V:12,C1:100,C2:200,C3:300},desc:"Ctotal = C1+C2+C3; same voltage."},
  {id:37,cat:"capacitor",name:"Charge Sharing",template:"cap_charge",params:{V:12,R1:5,C:200},desc:"Charged cap shares charge with uncharged cap."},
  {id:38,cat:"capacitor",name:"Capacitor Energy",template:"cap_charge",params:{V:12,R1:10,C:470},desc:"E = ½CV². Doubles when voltage doubles (×4)."},
  {id:39,cat:"capacitor",name:"Dielectric Effect",template:"cap_charge",params:{V:12,R1:10,C:250},desc:"Dielectric multiplies C by κ; stores more charge."},
  {id:40,cat:"capacitor",name:"Camera Flash",template:"cap_charge",params:{V:24,R1:5,C:1000},desc:"Large cap charged slowly, discharged rapidly."},
  {id:41,cat:"inductor",name:"Inductor in DC",template:"rl_growth",params:{V:12,R1:6,L:100},desc:"At steady state, inductor = wire (DC resistance only)."},
  {id:42,cat:"inductor",name:"RL Current Growth",template:"rl_growth",params:{V:12,R1:60,L:200},desc:"I(t)=(V/R)(1−e^(−tR/L)). τ=L/R."},
  {id:43,cat:"inductor",name:"RL Current Decay",template:"rl_growth",params:{V:12,R1:60,L:200},desc:"Source removed; inductor drives current via stored E."},
  {id:44,cat:"inductor",name:"Inductors in Series",template:"rl_growth",params:{V:12,R1:10,L:450},desc:"Ltotal = L1+L2+L3 (no mutual coupling)."},
  {id:45,cat:"inductor",name:"Inductors in Parallel",template:"rl_growth",params:{V:12,R1:10,L:67},desc:"1/Ltotal = 1/L1+1/L2; less total inductance."},
  {id:46,cat:"inductor",name:"Back EMF",template:"rl_growth",params:{V:12,R1:100,L:500},desc:"Switch open → inductor generates large reverse voltage spike."},
  {id:47,cat:"inductor",name:"Electromagnet Coil",template:"rl_growth",params:{V:9,R1:18,L:300},desc:"Field B ∝ current × turns. Builds up with τ=L/R."},
  {id:48,cat:"inductor",name:"Relay",template:"rl_growth",params:{V:5,R1:50,L:200},desc:"Coil energised → magnetic field closes mechanical contact."},
  {id:49,cat:"inductor",name:"Solenoid Field",template:"rl_growth",params:{V:9,R1:9,L:200},desc:"B = μ₀nI inside solenoid; proportional to current."},
  {id:50,cat:"inductor",name:"Inductor Energy",template:"inductor_energy",params:{V:12,R1:24,L:500},desc:"E = ½LI². Stored in magnetic field around coil."},
  {id:51,cat:"ac",name:"AC + Resistor",template:"ac_resistor",params:{Vpeak:170,f:50,R1:100},desc:"V and I in phase. Pavg = VrmsIrms."},
  {id:52,cat:"ac",name:"AC + Capacitor",template:"ac_cap",params:{Vpeak:170,f:50,C:100},desc:"I leads V by 90°. Xc=1/(2πfC). No average power."},
  {id:53,cat:"ac",name:"AC + Inductor",template:"ac_ind",params:{Vpeak:170,f:50,L:100},desc:"I lags V by 90°. XL=2πfL. No average power."},
  {id:54,cat:"ac",name:"Series RC",template:"series_rlc",params:{Vpeak:170,f:50,R1:100,L:0.001,C:100},desc:"Xc decreases with f; phase −45° when Xc=R."},
  {id:55,cat:"ac",name:"Series RL",template:"series_rlc",params:{Vpeak:170,f:50,R1:100,L:318,C:100000},desc:"XL increases with f; phase +45° when XL=R."},
  {id:56,cat:"ac",name:"Series RLC",template:"series_rlc",params:{Vpeak:170,f:50,R1:50,L:100,C:100},desc:"Minimum impedance at resonance f₀=1/(2π√LC)."},
  {id:57,cat:"ac",name:"Parallel RLC",template:"series_rlc",params:{Vpeak:170,f:50,R1:100,L:100,C:100},desc:"Each branch independent; total current phasor sum."},
  {id:58,cat:"ac",name:"RLC Resonance",template:"series_rlc",params:{Vpeak:170,f:50,R1:20,L:100,C:101},desc:"Tune f until Z=R for max current."},
  {id:59,cat:"ac",name:"Impedance Triangle",template:"series_rlc",params:{Vpeak:170,f:50,R1:60,L:200,C:50},desc:"R horizontal, (XL−Xc) vertical, Z hypotenuse."},
  {id:60,cat:"ac",name:"Phase Difference",template:"ac_resistor",params:{Vpeak:170,f:50,R1:100},desc:"V and I waveforms offset by phase angle φ."},
  {id:61,cat:"ac",name:"Power Factor",template:"series_rlc",params:{Vpeak:170,f:50,R1:80,L:200,C:50},desc:"PF = cosφ = R/Z. Unity = all power useful."},
  {id:62,cat:"ac",name:"AC Frequency Response",template:"series_rlc",params:{Vpeak:170,f:100,R1:100,L:100,C:100},desc:"Sweep f to see how Z, I, φ change."},
  {id:63,cat:"ac",name:"Low-Pass RC Filter",template:"series_rlc",params:{Vpeak:100,f:100,R1:100,L:0.001,C:100},desc:"Output across C. fc=1/(2πRC). Low f pass."},
  {id:64,cat:"ac",name:"High-Pass RC Filter",template:"series_rlc",params:{Vpeak:100,f:100,R1:100,L:0.001,C:10},desc:"Output across R. High f pass. Same fc."},
  {id:65,cat:"ac",name:"Band-Pass RLC",template:"series_rlc",params:{Vpeak:100,f:50,R1:20,L:100,C:100},desc:"Selects frequencies near f₀. BW = R/L."},
  {id:66,cat:"diodes",name:"Diode Forward Bias",template:"diode_fwd",params:{V:5,R1:100},desc:"Silicon diode drops ~0.7V when forward biased."},
  {id:67,cat:"diodes",name:"Diode Reverse Bias",template:"diode_rev",params:{V:5,R1:100},desc:"Reverse biased: blocks conventional current."},
  {id:68,cat:"diodes",name:"LED Circuit",template:"led_circuit",params:{V:5,R1:220,Vf:2.0},desc:"LED emits light; needs current-limiting resistor."},
  {id:69,cat:"diodes",name:"LED + Limiting Resistor",template:"led_circuit",params:{V:9,R1:330,Vf:2.0},desc:"R = (V−Vf)/If protects LED from overcurrent."},
  {id:70,cat:"diodes",name:"Half-Wave Rectifier",template:"half_wave",params:{Vpeak:12,f:50,Rload:1000},desc:"Single diode; positive half-cycles only."},
  {id:71,cat:"diodes",name:"Full-Wave Rectifier",template:"full_wave",params:{Vpeak:12,f:50,Rload:1000},desc:"Four diodes; both half-cycles → positive DC."},
  {id:72,cat:"diodes",name:"Rectifier + Smoothing Cap",template:"half_wave",params:{Vpeak:12,f:50,Rload:1000},desc:"Capacitor reduces ripple on rectified output."},
  {id:73,cat:"diodes",name:"Zener Regulator",template:"zener_reg",params:{V:15,Rser:200,Vz:5.1},desc:"Zener clamps output at Vz in reverse breakdown."},
  {id:74,cat:"diodes",name:"LDR Circuit",template:"ldr_circuit",params:{V:9,Rfixed:1000,Rldr:500},desc:"LDR resistance falls with light; voltage divider output changes."},
  {id:75,cat:"diodes",name:"Thermistor Circuit",template:"thermistor",params:{V:5,Rfixed:1000,temp:25},desc:"NTC thermistor: R falls as temperature rises."},
  {id:76,cat:"diodes",name:"Transistor Switch",template:"transistor_switch",params:{Vcc:9,Ib_ua:50,Rbase:47000,Rcollector:1000,hFE:100},desc:"Base current controls collector current: Ic=hFE×Ib."},
  {id:77,cat:"diodes",name:"Transistor LED",template:"transistor_switch",params:{Vcc:5,Ib_ua:30,Rbase:10000,Rcollector:220,hFE:100},desc:"Logic signal at base switches LED load."},
  {id:78,cat:"diodes",name:"NOT Gate",template:"transistor_switch",params:{Vcc:5,Ib_ua:100,Rbase:1000,Rcollector:1000,hFE:100},desc:"High input → transistor ON → output LOW. Inverter."},
  {id:79,cat:"diodes",name:"AND Gate (Switches)",template:"and_gate",params:{V:5,R1:1000,sw1:false,sw2:false},desc:"Output HIGH only when BOTH switches closed."},
  {id:80,cat:"diodes",name:"OR Gate (Switches)",template:"or_gate",params:{V:5,R1:1000,sw1:false,sw2:false},desc:"Output HIGH when EITHER switch closed."},
  {id:81,cat:"practical",name:"Fuse Protection",template:"fuse_circuit",params:{V:12,R1:5,Ifuse:2},desc:"Fuse melts if I > rating, breaking circuit."},
  {id:82,cat:"practical",name:"Circuit Breaker",template:"fuse_circuit",params:{V:240,R1:100,Ifuse:15},desc:"Resettable overcurrent protection."},
  {id:83,cat:"practical",name:"Electric Heater",template:"single_bulb",params:{V:240,R1:48},desc:"P = V²/R. Heat = I²Rt. All energy → heat."},
  {id:84,cat:"practical",name:"Electric Motor",template:"motor_circuit",params:{V:12,R1:2,Vback:8},desc:"Back-EMF opposes supply; limits running current."},
  {id:85,cat:"practical",name:"Generator + Load",template:"generator",params:{Vgen:240,Rload:120,Rint:5},desc:"Internal resistance causes terminal V drop under load."},
  {id:86,cat:"practical",name:"Transformer",template:"transformer",params:{Vp:240,Np:2000,Ns:200,Rload:10},desc:"Vs/Vp = Ns/Np. Power conserved (ideal)."},
  {id:87,cat:"practical",name:"Doorbell Circuit",template:"switch_bulb",params:{V:12,R1:50,sw:false},desc:"Momentary button energises buzzer coil."},
  {id:88,cat:"practical",name:"Torch/Flashlight",template:"switch_bulb",params:{V:4.5,R1:15,sw:false},desc:"Battery → switch → bulb. Series circuit."},
  {id:89,cat:"practical",name:"Battery Charging",template:"charging",params:{Vcharger:14.4,Vbatt:12,Rseries:2},desc:"Charger > battery EMF; current flows in to recharge."},
  {id:90,cat:"practical",name:"Solar Cell + Load",template:"basic_series",params:{V:18,R1:9},desc:"Solar cell as voltage source; MPP for max power."},
  {id:91,cat:"practical",name:"Household Wiring",template:"parallel3",params:{V:230,R1:1150,R2:460,R3:230},desc:"All appliances in parallel; same mains voltage."},
  {id:92,cat:"practical",name:"Ammeter (Correct)",template:"basic_series",params:{V:12,R1:6},desc:"Ammeter in series; low R. Reads branch current."},
  {id:93,cat:"practical",name:"Voltmeter (Correct)",template:"voltage_divider",params:{V:12,R1:6,R2:1000000},desc:"Voltmeter in parallel; very high R. Reads PD."},
  {id:94,cat:"practical",name:"Ammeter (Wrong)",template:"short_circuit",params:{V:12,r:0.01},desc:"Ammeter across component = short circuit! Dangerous."},
  {id:95,cat:"practical",name:"Voltmeter (Wrong)",template:"basic_series",params:{V:12,R1:1000000},desc:"Voltmeter in series blocks current; reads ≈ supply V."},
  {id:96,cat:"practical",name:"Earth Wire Safety",template:"fuse_circuit",params:{V:230,R1:500,Ifuse:10},desc:"Earth gives fault current safe path → trips breaker."},
  {id:97,cat:"practical",name:"Three-Pin Plug",template:"fuse_circuit",params:{V:230,R1:500,Ifuse:13},desc:"Live (brown), Neutral (blue), Earth (green/yellow)."},
  {id:98,cat:"practical",name:"Power Transmission",template:"transformer",params:{Vp:11000,Np:11000,Ns:400000,Rload:20},desc:"High V → low I → less I²R line losses."},
  {id:99,cat:"practical",name:"Joule Heating",template:"joule_heat",params:{V:12,R1:4,t:60},desc:"H = I²Rt = V²t/R. Heat proportional to I² and t."},
  {id:100,cat:"practical",name:"Power & Energy Meter",template:"power_meter",params:{V:240,R1:1200,t:3600},desc:"E = Pt. 1 kWh = 3,600,000 J."},
];

// ============================================================
// UTILITIES
// ============================================================
function safe(v,fb=0){return isFinite(v)&&!isNaN(v)?v:fb;}
function fmtA(i){const a=Math.abs(i);if(a<0.001)return (i*1e6).toFixed(1)+" μA";if(a<0.1)return (i*1000).toFixed(2)+" mA";return safe(i).toFixed(3)+" A";}
function fmtV(v){return safe(v).toFixed(2)+" V";}
function fmtR(r){if(r>=1e6)return (r/1e6).toFixed(2)+" MΩ";if(r>=1000)return (r/1000).toFixed(2)+" kΩ";return safe(r).toFixed(2)+" Ω";}
function fmtW(p){if(p>=1000)return (p/1000).toFixed(2)+" kW";if(p<1)return (p*1000).toFixed(1)+" mW";return safe(p).toFixed(2)+" W";}
function fmtJ(e){if(e>=1000)return (e/1000).toFixed(2)+" kJ";if(e<1)return (e*1000).toFixed(1)+" mJ";return safe(e).toFixed(2)+" J";}
function fmtF(c){if(c>=1)return c.toFixed(2)+" F";if(c>=1e-3)return (c*1e3).toFixed(1)+" mF";return (c*1e6).toFixed(1)+" μF";}
function fmtHz(f){if(f>=1000)return (f/1000).toFixed(2)+" kHz";return safe(f).toFixed(2)+" Hz";}
function calcParR(...Rs){const s=Rs.reduce((a,r)=>a+(r>0?1/r:0),0);return s>0?1/s:Infinity;}
function calcCapSer(...Cs){const s=Cs.reduce((a,c)=>a+(c>0?1/c:0),0);return s>0?1/s:0;}
function xcap(f,C){return safe(1/(2*Math.PI*f*C),1e9);}
function xind(f,L){return 2*Math.PI*f*L;}
function zlrc(R,XL,XC){return Math.sqrt(R*R+Math.pow(XL-XC,2));}
function resF(L,C){return 1/(2*Math.PI*Math.sqrt(L*C));}

// ============================================================
// SVG SYMBOLS
// ============================================================
function Wire({x1,y1,x2,y2,color="#e2e8f0",sw=2.5}){
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={sw} strokeLinecap="round"/>;
}
function Battery({x,y,label,rotate=0}){
  return(
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      <line x1="-20" y1="0" x2="-8" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      <line x1="-8" y1="-12" x2="-8" y2="12" stroke="#e2e8f0" strokeWidth="4"/>
      <line x1="0" y1="-7" x2="0" y2="7" stroke="#e2e8f0" strokeWidth="2"/>
      <line x1="8" y1="-12" x2="8" y2="12" stroke="#e2e8f0" strokeWidth="4"/>
      <line x1="16" y1="-7" x2="16" y2="7" stroke="#e2e8f0" strokeWidth="2"/>
      <line x1="24" y1="0" x2="20" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      <text x="-8" y="-16" fill="#f59e0b" fontSize="9" textAnchor="middle">+</text>
      <text x="8" y="-16" fill="#a1a1aa" fontSize="9" textAnchor="middle">−</text>
      {label&&<text x="4" y="22" fill="#a1a1aa" fontSize="10" textAnchor="middle">{label}</text>}
    </g>
  );
}
function Resistor({x,y,label,rotate=0,color="#e2e8f0",variable=false}){
  return(
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      <line x1="-25" y1="0" x2="-15" y2="0" stroke={color} strokeWidth="2.5"/>
      <rect x="-15" y="-8" width="30" height="16" fill="none" stroke={color} strokeWidth="2" rx="2"/>
      <line x1="15" y1="0" x2="25" y2="0" stroke={color} strokeWidth="2.5"/>
      {variable&&<><line x1="-18" y1="10" x2="18" y2="-10" stroke="#f59e0b" strokeWidth="1.5"/><polygon points="18,-10 12,-8 14,-14" fill="#f59e0b"/></>}
      {label&&<text x="0" y="22" fill="#a1a1aa" fontSize="10" textAnchor="middle">{label}</text>}
    </g>
  );
}
function Bulb({x,y,label,brightness=1,rotate=0}){
  const gl=brightness>0?`rgba(253,224,71,${Math.min(brightness*0.7,0.7)})`:"transparent";
  const fi=brightness>0?`rgba(253,224,71,${Math.min(brightness*0.35,0.35)})`:"transparent";
  return(
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      {brightness>0.1&&<circle cx="0" cy="0" r="18" fill={gl} opacity="0.5"/>}
      <line x1="-25" y1="0" x2="-12" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      <circle cx="0" cy="0" r="12" fill={fi} stroke="#e2e8f0" strokeWidth="2"/>
      <line x1="-5" y1="4" x2="-1" y2="-3" stroke="#fde047" strokeWidth="1.5"/>
      <line x1="-1" y1="-3" x2="3" y2="4" stroke="#fde047" strokeWidth="1.5"/>
      <line x1="3" y1="4" x2="7" y2="-3" stroke="#fde047" strokeWidth="1.5"/>
      <line x1="12" y1="0" x2="25" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      {label&&<text x="0" y="22" fill="#a1a1aa" fontSize="10" textAnchor="middle">{label}</text>}
    </g>
  );
}
function SwitchSym({x,y,closed=false,label,rotate=0,onClick}){
  return(
    <g transform={`translate(${x},${y}) rotate(${rotate})`} onClick={onClick} style={{cursor:onClick?"pointer":"default"}}>
      <line x1="-20" y1="0" x2="-8" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      <circle cx="-8" cy="0" r="3" fill="#38bdf8"/>
      <line x1="-8" y1="0" x2={closed?8:10} y2={closed?0:-12} stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="8" cy="0" r="3" fill="#38bdf8"/>
      <line x1="8" y1="0" x2="20" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      {label&&<text x="0" y={closed?14:18} fill="#a1a1aa" fontSize="10" textAnchor="middle">{label}</text>}
    </g>
  );
}
function Capacitor({x,y,label,rotate=0}){
  return(
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      <line x1="-20" y1="0" x2="-5" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      <line x1="-5" y1="-12" x2="-5" y2="12" stroke="#e2e8f0" strokeWidth="3.5"/>
      <line x1="5" y1="-12" x2="5" y2="12" stroke="#e2e8f0" strokeWidth="3.5"/>
      <line x1="5" y1="0" x2="20" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      {label&&<text x="0" y="22" fill="#a1a1aa" fontSize="10" textAnchor="middle">{label}</text>}
    </g>
  );
}
function Inductor({x,y,label,rotate=0}){
  const bumps=4,bw=36/bumps;
  let d=`M -25,0 L -18,0 `;
  for(let i=0;i<bumps;i++) d+=`A ${bw/2} ${bw/2} 0 0 1 ${-18+(i+1)*bw} 0 `;
  d+=`L 25,0`;
  return(
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      <path d={d} fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round"/>
      {label&&<text x="0" y="18" fill="#a1a1aa" fontSize="10" textAnchor="middle">{label}</text>}
    </g>
  );
}
function Diode({x,y,label,rotate=0,zener=false,led=false}){
  const col=led?"#22c55e":"#e2e8f0";
  return(
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      <line x1="-20" y1="0" x2="-10" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      <polygon points="-10,0 10,-10 10,10" fill={col} stroke="#e2e8f0" strokeWidth="1.5"/>
      <line x1="10" y1="-12" x2="10" y2="12" stroke="#e2e8f0" strokeWidth="3"/>
      {zener&&<><line x1="10" y1="-12" x2="14" y2="-12" stroke="#e2e8f0" strokeWidth="2"/><line x1="10" y1="12" x2="6" y2="12" stroke="#e2e8f0" strokeWidth="2"/></>}
      {led&&<><line x1="6" y1="-8" x2="14" y2="-16" stroke="#22c55e" strokeWidth="1.5"/><line x1="10" y1="-4" x2="18" y2="-12" stroke="#22c55e" strokeWidth="1.5"/></>}
      <line x1="10" y1="0" x2="20" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      {label&&<text x="0" y="22" fill="#a1a1aa" fontSize="10" textAnchor="middle">{label}</text>}
    </g>
  );
}
function ACSource({x,y,label,rotate=0}){
  return(
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      <circle cx="0" cy="0" r="18" fill="none" stroke="#e2e8f0" strokeWidth="2"/>
      <path d="M -8,0 Q -4,-10 0,0 Q 4,10 8,0" fill="none" stroke="#38bdf8" strokeWidth="2"/>
      <line x1="-20" y1="0" x2="-18" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      <line x1="18" y1="0" x2="20" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      {label&&<text x="0" y="28" fill="#a1a1aa" fontSize="10" textAnchor="middle">{label}</text>}
    </g>
  );
}
function Transformer({x,y}){
  return(
    <g transform={`translate(${x},${y})`}>
      {[0,1,2,3].map(i=><path key={`p${i}`} d={`M -28,${-15+i*10} Q -20,${-15+i*10-7} -12,${-15+i*10}`} fill="none" stroke="#e2e8f0" strokeWidth="2"/>)}
      {[0,1,2,3].map(i=><path key={`s${i}`} d={`M 28,${-15+i*10} Q 20,${-15+i*10-7} 12,${-15+i*10}`} fill="none" stroke="#e2e8f0" strokeWidth="2"/>)}
      <line x1="-10" y1="-22" x2="-10" y2="22" stroke="#a1a1aa" strokeWidth="4" strokeDasharray="2,2"/>
      <line x1="10" y1="-22" x2="10" y2="22" stroke="#a1a1aa" strokeWidth="4" strokeDasharray="2,2"/>
    </g>
  );
}
function Transistor({x,y}){
  return(
    <g transform={`translate(${x},${y})`}>
      <circle cx="0" cy="0" r="20" fill="none" stroke="#e2e8f0" strokeWidth="1.5"/>
      <line x1="-20" y1="0" x2="-8" y2="0" stroke="#e2e8f0" strokeWidth="2"/>
      <line x1="-8" y1="-14" x2="-8" y2="14" stroke="#e2e8f0" strokeWidth="3"/>
      <line x1="-8" y1="-10" x2="12" y2="-22" stroke="#e2e8f0" strokeWidth="2"/>
      <polygon points="4,-15 12,-22 8,-13" fill="#e2e8f0"/>
      <line x1="-8" y1="10" x2="12" y2="22" stroke="#e2e8f0" strokeWidth="2"/>
    </g>
  );
}
function Fuse({x,y,label,blown=false,rotate=0}){
  return(
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      <line x1="-20" y1="0" x2="-12" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      <rect x="-12" y="-6" width="24" height="12" fill="none" stroke={blown?"#ef4444":"#e2e8f0"} strokeWidth="2" rx="3"/>
      {blown?<path d="M -6,0 Q 0,-5 6,0" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2"/>:<line x1="-8" y1="0" x2="8" y2="0" stroke="#f59e0b" strokeWidth="2"/>}
      <line x1="12" y1="0" x2="20" y2="0" stroke="#e2e8f0" strokeWidth="2.5"/>
      {label&&<text x="0" y="18" fill="#a1a1aa" fontSize="10" textAnchor="middle">{label}</text>}
    </g>
  );
}
function Junction({x,y}){return <circle cx={x} cy={y} r="4" fill="#38bdf8"/>;}
function Lbl({x,y,text,anchor="middle",color="#a1a1aa",size=11}){
  return <text x={x} y={y} fill={color} fontSize={size} textAnchor={anchor} fontFamily="monospace">{text}</text>;
}

// ============================================================
// PIPE-FLOW ANIMATION
// ============================================================
function PipeFlow({points,current,maxI,running,lowPerf,reverse=false}){
  const [particles,setParticles]=useState([]);
  const pRef=useRef([]);
  const rafRef=useRef(null);
  const lastT=useRef(null);

  const pathStr=useMemo(()=>{
    if(!points||points.length<2)return"";
    return points.map((p,i)=>(i===0?`M ${p[0]},${p[1]}`:`L ${p[0]},${p[1]}`)).join(" ");
  },[points]);

  const totalLen=useMemo(()=>{
    if(!points||points.length<2)return 0;
    let l=0;
    for(let i=1;i<points.length;i++){const dx=points[i][0]-points[i-1][0],dy=points[i][1]-points[i-1][1];l+=Math.sqrt(dx*dx+dy*dy);}
    return l;
  },[points]);

  const pCount=useMemo(()=>{
    if(Math.abs(current)<0.0001)return 0;
    const base=lowPerf?3:7;
    return Math.max(1,Math.round(base*Math.min(Math.abs(current)/Math.max(maxI,0.001),1)));
  },[current,maxI,lowPerf]);

  const spd=useMemo(()=>{
    if(Math.abs(current)<0.0001)return 0;
    return Math.max(15,Math.min(Math.abs(current)/Math.max(maxI,0.001),1)*130);
  },[current,maxI]);

  function ptAtLen(len){
    if(!points||points.length<2)return[0,0];
    let acc=0;
    for(let i=1;i<points.length;i++){
      const dx=points[i][0]-points[i-1][0],dy=points[i][1]-points[i-1][1];
      const seg=Math.sqrt(dx*dx+dy*dy);
      if(acc+seg>=len){const f=(len-acc)/seg;return[points[i-1][0]+f*dx,points[i-1][1]+f*dy];}
      acc+=seg;
    }
    return points[points.length-1];
  }

  useEffect(()=>{
    if(!pCount||!totalLen){pRef.current=[];setParticles([]);return;}
    pRef.current=Array.from({length:pCount},(_,i)=>({id:i,pos:(i/pCount)*totalLen}));
  },[pCount,totalLen]);

  useEffect(()=>{
    if(!running||Math.abs(current)<0.0001||!totalLen){
      if(rafRef.current)cancelAnimationFrame(rafRef.current);
      lastT.current=null;
      return;
    }
    function step(ts){
      if(lastT.current!==null){
        const dt=Math.min((ts-lastT.current)/1000,0.05);
        const dir=(current>0)===!reverse?1:-1;
        pRef.current=pRef.current.map(p=>({...p,pos:((p.pos+dir*spd*dt)%totalLen+totalLen)%totalLen}));
        setParticles(pRef.current.map(p=>{const[px,py]=ptAtLen(p.pos);return{id:p.id,x:px,y:py};}));
      }
      lastT.current=ts;
      rafRef.current=requestAnimationFrame(step);
    }
    rafRef.current=requestAnimationFrame(step);
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);};
  },[running,current,spd,totalLen,reverse]);

  if(!pathStr||!totalLen)return null;
  const pw=6;
  return(
    <g>
      {/* Pipe outer glow */}
      <path d={pathStr} fill="none" stroke="rgba(56,189,248,0.10)" strokeWidth={pw+6} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Pipe wall */}
      <path d={pathStr} fill="none" stroke="rgba(56,189,248,0.30)" strokeWidth={pw} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Pipe interior dark */}
      <path d={pathStr} fill="none" stroke="rgba(8,9,11,0.6)" strokeWidth={pw-3} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Particles */}
      {particles.map(p=>(
        <g key={p.id}>
          <circle cx={p.x} cy={p.y} r={2.8} fill="#38bdf8" opacity="0.95"/>
          <circle cx={p.x} cy={p.y} r={4.5} fill="#38bdf8" opacity="0.25"/>
        </g>
      ))}
    </g>
  );
}

// Wire + pipe combined
function WP({points,current,maxI,running,lowPerf,wireColor="#e2e8f0",reverse=false}){
  const d=useMemo(()=>{
    if(!points||points.length<2)return"";
    return points.map((p,i)=>(i===0?`M ${p[0]},${p[1]}`:`L ${p[0]},${p[1]}`)).join(" ");
  },[points]);
  return(
    <g>
      <path d={d} fill="none" stroke={wireColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <PipeFlow points={points} current={current} maxI={maxI} running={running} lowPerf={lowPerf} reverse={reverse}/>
    </g>
  );
}

// ============================================================
// SVG GRAPH
// ============================================================
function SVGGraph({data,data2,xLbl,yLbl,yLbl2,title,marker,lowPerf}){
  const W=300,H=160,pad={t:18,r:20,b:34,l:46};
  const iW=W-pad.l-pad.r,iH=H-pad.t-pad.b;
  const pts=lowPerf?data.filter((_,i)=>i%2===0):data;
  const pts2=data2?(lowPerf?data2.filter((_,i)=>i%2===0):data2):null;
  const allY=[...pts.map(p=>p.y),...(pts2?pts2.map(p=>p.y):[])];
  const allX=pts.map(p=>p.x);
  const xMin=allX.length?Math.min(...allX):0,xMax=allX.length?Math.max(...allX):1;
  const yMin=allY.length?Math.min(...allY):0,yMax=allY.length?Math.max(...allY):1;
  const xR=xMax-xMin||1,yR=yMax-yMin||1;
  const toX=x=>pad.l+((x-xMin)/xR)*iW;
  const toY=y=>pad.t+iH-((y-yMin)/yR)*iH;
  const pf=arr=>arr.map((p,i)=>`${i===0?"M":"L"} ${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`).join(" ");
  return(
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:340}}>
      {Array.from({length:5},(_,i)=>{const y=pad.t+(i/4)*iH,v=yMax-(i/4)*yR;return(
        <g key={i}>
          <line x1={pad.l} y1={y} x2={W-pad.r} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          <text x={pad.l-4} y={y+3} fill="#a1a1aa" fontSize="8" textAnchor="end">{Math.abs(v)>99?v.toFixed(0):v.toFixed(1)}</text>
        </g>
      );})}
      {Array.from({length:6},(_,i)=>{const x=pad.l+(i/5)*iW,v=xMin+(i/5)*xR;return(
        <g key={i}>
          <line x1={x} y1={pad.t} x2={x} y2={H-pad.b} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          <text x={x} y={H-pad.b+12} fill="#a1a1aa" fontSize="8" textAnchor="middle">{v.toFixed(v>99?0:1)}</text>
        </g>
      );})}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H-pad.b} stroke="#a1a1aa" strokeWidth="1"/>
      <line x1={pad.l} y1={H-pad.b} x2={W-pad.r} y2={H-pad.b} stroke="#a1a1aa" strokeWidth="1"/>
      {yMin<0&&yMax>0&&<line x1={pad.l} y1={toY(0)} x2={W-pad.r} y2={toY(0)} stroke="#a1a1aa" strokeWidth="1" strokeDasharray="3,3"/>}
      {pts.length>1&&<path d={pf(pts)} fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round"/>}
      {pts2&&pts2.length>1&&<path d={pf(pts2)} fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round"/>}
      {marker!==undefined&&<line x1={toX(marker)} y1={pad.t} x2={toX(marker)} y2={H-pad.b} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2"/>}
      <text x={W/2} y={H-2} fill="#a1a1aa" fontSize="9" textAnchor="middle">{xLbl}</text>
      <text x={9} y={H/2} fill="#38bdf8" fontSize="9" textAnchor="middle" transform={`rotate(-90,9,${H/2})`}>{yLbl}</text>
      {yLbl2&&<text x={W-5} y={H/2} fill="#f59e0b" fontSize="9" textAnchor="middle" transform={`rotate(90,${W-5},${H/2})`}>{yLbl2}</text>}
      {title&&<text x={W/2} y={13} fill="#f4f4f5" fontSize="10" textAnchor="middle" fontWeight="bold">{title}</text>}
    </svg>
  );
}

// ============================================================
// CIRCUIT RENDERERS
// ============================================================
function renderParallel3(p,simT,run,lp){
  const {V,R1,R2,R3}=p;
  const I1=safe(V/R1),I2=safe(V/R2),I3=safe(V/R3),It=I1+I2+I3;
  const Rt=safe(V/It),mx=It||1;
  const diag=(
    <svg viewBox="0 0 520 330" style={{width:"100%"}}>
      {/* Rails */}
      <WP points={[[60,70],[220,70]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[220,70],[460,70]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[460,70],[460,260]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[460,260],[220,260]]} current={It} maxI={mx} running={run} lowPerf={lp} reverse/>
      <WP points={[[220,260],[60,260]]} current={It} maxI={mx} running={run} lowPerf={lp} reverse/>
      <WP points={[[60,260],[60,70]]} current={It} maxI={mx} running={run} lowPerf={lp} reverse/>
      {/* Battery */}
      <Battery x={60} y={165} label={`${V}V`} rotate={90}/>
      {/* Branch 1 */}
      <WP points={[[220,70],[220,125]]} current={I1} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={220} y={165} label={`R₁=${R1}Ω`} rotate={90}/>
      <WP points={[[220,205],[220,260]]} current={I1} maxI={mx} running={run} lowPerf={lp} reverse/>
      {/* Branch 2 */}
      <WP points={[[310,70],[310,125]]} current={I2} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={310} y={165} label={`R₂=${R2}Ω`} rotate={90}/>
      <WP points={[[310,205],[310,260]]} current={I2} maxI={mx} running={run} lowPerf={lp} reverse/>
      {/* Branch 3 */}
      <WP points={[[400,70],[400,125]]} current={I3} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={400} y={165} label={`R₃=${R3}Ω`} rotate={90}/>
      <WP points={[[400,205],[400,260]]} current={I3} maxI={mx} running={run} lowPerf={lp} reverse/>
      {/* Junctions */}
      <Junction x={220} y={70}/><Junction x={310} y={70}/><Junction x={400} y={70}/>
      <Junction x={220} y={260}/><Junction x={310} y={260}/><Junction x={400} y={260}/>
      {/* Labels */}
      <Lbl x={220} y={58} text={`I₁=${fmtA(I1)}`} color="#f59e0b" size={10}/>
      <Lbl x={310} y={58} text={`I₂=${fmtA(I2)}`} color="#f59e0b" size={10}/>
      <Lbl x={400} y={58} text={`I₃=${fmtA(I3)}`} color="#f59e0b" size={10}/>
      <Lbl x={260} y={315} text={`Itotal=${fmtA(It)}  Rtotal=${fmtR(Rt)}`} color="#38bdf8" size={11}/>
    </svg>
  );
  const gd=Array.from({length:25},(_,i)=>{const v=i*24/24;return{x:v,y:v*(1/R1+1/R2+1/R3)};});
  const meas=[
    {l:"Itotal",v:fmtA(It),c:"#38bdf8"},{l:"I₁",v:fmtA(I1),c:"#a1a1aa"},
    {l:"I₂",v:fmtA(I2),c:"#a1a1aa"},{l:"I₃",v:fmtA(I3),c:"#a1a1aa"},
    {l:"Rtotal",v:fmtR(Rt),c:"#e2e8f0"},{l:"Power",v:fmtW(It*V),c:"#22c55e"},
  ];
  const eq=[
    {s:"1/Rt = 1/R₁+1/R₂+1/R₃",n:`1/${R1}+1/${R2}+1/${R3} → Rt=${Rt.toFixed(2)} Ω`},
    {s:"I₁=V/R₁, I₂=V/R₂, I₃=V/R₃",n:`${fmtA(I1)}, ${fmtA(I2)}, ${fmtA(I3)}`},
    {s:"Itotal = I₁+I₂+I₃",n:`= ${fmtA(It)}`},
  ];
  const ch={t:"Adjust resistors until Itotal = exactly 4.50 A.",h:`Rtotal = V/4.5 = ${(V/4.5).toFixed(2)}Ω. Equal branches: each R = ${(V/4.5*3).toFixed(1)}Ω.`,fn:()=>Math.abs(It-4.5)<0.08};
  return{diag,meas,eq,gd,xLbl:"V (V)",yLbl:"I (A)",ch};
}

function renderSeries3(p,simT,run,lp){
  const {V,R1,R2,R3}=p;
  const Rt=R1+R2+R3,I=safe(V/Rt);
  const V1=I*R1,V2=I*R2,V3=I*R3,mx=I||0.5;
  const diag=(
    <svg viewBox="0 0 500 280" style={{width:"100%"}}>
      <WP points={[[60,70],[120,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={145} y={70} label={`R₁=${R1}Ω`}/>
      <WP points={[[175,70],[245,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={270} y={70} label={`R₂=${R2}Ω`}/>
      <WP points={[[300,70],[370,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={395} y={70} label={`R₃=${R3}Ω`}/>
      <WP points={[[420,70],[440,70],[440,200],[60,200]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={135} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,107]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,163],[60,200]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={145} y={52} text={`V₁=${fmtV(V1)}`} color="#f59e0b" size={10}/>
      <Lbl x={270} y={52} text={`V₂=${fmtV(V2)}`} color="#f59e0b" size={10}/>
      <Lbl x={395} y={52} text={`V₃=${fmtV(V3)}`} color="#f59e0b" size={10}/>
      <Lbl x={250} y={265} text={`I=${fmtA(I)}  Rtotal=${fmtR(Rt)}`} color="#38bdf8" size={11}/>
    </svg>
  );
  const gd=Array.from({length:25},(_,i)=>{const v=i*24/24;return{x:v,y:v/Rt};});
  const meas=[{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"Rtotal",v:fmtR(Rt),c:"#e2e8f0"},{l:"V₁",v:fmtV(V1),c:"#f59e0b"},{l:"V₂",v:fmtV(V2),c:"#f59e0b"},{l:"V₃",v:fmtV(V3),c:"#f59e0b"},{l:"Power",v:fmtW(I*V),c:"#22c55e"}];
  const eq=[{s:"Rt=R₁+R₂+R₃",n:`${R1}+${R2}+${R3}=${Rt} Ω`},{s:"I=V/Rt",n:`${V}/${Rt}=${fmtA(I)}`},{s:"V₁=IR₁",n:`${fmtA(I)}×${R1}=${fmtV(V1)}`}];
  const ch={t:"Adjust resistors until total current = 2.00 A.",h:`Rtotal must = ${(V/2).toFixed(1)} Ω`,fn:()=>Math.abs(I-2.0)<0.06};
  return{diag,meas,eq,gd,xLbl:"V (V)",yLbl:"I (A)",ch};
}

function renderBasicSeries(p,simT,run,lp){
  const {V,R1}=p,I=safe(V/R1),mx=I||0.5;
  const diag=(
    <svg viewBox="0 0 400 220" style={{width:"100%"}}>
      <WP points={[[60,70],[180,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={205} y={70} label={`R=${R1}Ω`}/>
      <WP points={[[235,70],[360,70],[360,160],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={115} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,87]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,143],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={205} y={52} text={`VR=${fmtV(I*R1)}`} color="#f59e0b" size={10}/>
      <Lbl x={210} y={205} text={`I=${fmtA(I)}  P=${fmtW(I*V)}`} color="#38bdf8"/>
    </svg>
  );
  const gd=Array.from({length:25},(_,i)=>{const r=1+i*10;return{x:r,y:V/r};});
  const meas=[{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"Voltage Drop",v:fmtV(I*R1),c:"#f59e0b"},{l:"Power",v:fmtW(I*V),c:"#22c55e"}];
  const eq=[{s:"I=V/R",n:`${V}/${R1}=${fmtA(I)}`},{s:"P=VI",n:`${V}×${fmtA(I)}=${fmtW(I*V)}`}];
  const ch={t:"Adjust R so current = exactly 1.00 A.",h:`R = V/I = ${V}/1 = ${V} Ω`,fn:()=>Math.abs(I-1.0)<0.05};
  return{diag,meas,eq,gd,xLbl:"R (Ω)",yLbl:"I (A)",ch};
}

function renderSwitchBulb(p,upd,simT,run,lp){
  const {V,R1,sw}=p,I=sw?safe(V/R1):0,br=sw?Math.min(I*R1/12,1):0,mx=safe(V/R1)||0.5;
  const diag=(
    <svg viewBox="0 0 420 230" style={{width:"100%"}}>
      <WP points={[[60,70],[170,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <SwitchSym x={190} y={70} closed={sw} label={sw?"CLOSED":"OPEN"} onClick={()=>upd("sw",!sw)}/>
      <WP points={[[210,70],[285,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Bulb x={315} y={70} brightness={br} label={`${R1}Ω`}/>
      <WP points={[[345,70],[380,70],[380,170],[60,170]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={120} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,92]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,148],[60,170]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={210} y={210} text={sw?`I=${fmtA(I)} — Click switch to open`:`I=0 — Click switch to close`} color={sw?"#22c55e":"#f59e0b"}/>
    </svg>
  );
  const gd=[{x:0,y:sw?I:0},{x:10,y:sw?I:0}];
  const meas=[{l:"Switch",v:sw?"CLOSED":"OPEN",c:sw?"#22c55e":"#ef4444"},{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"Bulb Power",v:fmtW(I*I*R1),c:"#fde047"}];
  const eq=[{s:sw?"I=V/R":"I=0 (open)",n:sw?`${V}/${R1}=${fmtA(I)}`:"No closed path"}];
  const ch={t:"Close the switch to light the bulb, then open it again.",h:"Click the switch symbol in the diagram.",fn:()=>sw};
  return{diag,meas,eq,gd,xLbl:"t",yLbl:"I (A)",ch};
}

function renderOpenCircuit(p,simT,run,lp){
  const {V}=p;
  const diag=(
    <svg viewBox="0 0 400 210" style={{width:"100%"}}>
      <Wire x1={60} y1={70} x2={185} y2={70} stroke="#e2e8f0" sw={2.5}/>
      <SwitchSym x={205} y={70} closed={false} label="OPEN"/>
      <Wire x1={225} y1={70} x2={350} y2={70} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={350} y1={70} x2={350} y2={160} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={350} y1={160} x2={60} y2={160} stroke="#e2e8f0" sw={2.5}/>
      <Battery x={60} y={115} label={`${V}V`} rotate={90}/>
      <Wire x1={60} y1={70} x2={60} y2={87} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={60} y1={143} x2={60} y2={160} stroke="#e2e8f0" sw={2.5}/>
      <Lbl x={205} y={195} text="No current — path is broken" color="#f59e0b"/>
      <Lbl x={210} y={45} text={`${V}V potential exists but cannot drive current`} color="#a1a1aa" size={10}/>
    </svg>
  );
  const gd=[{x:0,y:0},{x:10,y:0}];
  const meas=[{l:"Current",v:"0 A",c:"#ef4444"},{l:"Source V",v:fmtV(V),c:"#f59e0b"}];
  const eq=[{s:"Open circuit → I=0",n:"No closed loop — charge cannot flow."}];
  const ch={t:"Why is there voltage but no current?",h:"Voltage is potential. Current requires a closed conducting path.",fn:()=>true};
  return{diag,meas,eq,gd,xLbl:"t",yLbl:"I (A)",ch};
}

function renderShortCircuit(p,simT,run,lp){
  const {V,r}=p,I=safe(V/Math.max(r,0.01)),mx=I;
  const diag=(
    <svg viewBox="0 0 400 210" style={{width:"100%"}}>
      <WP points={[[60,70],[220,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={220} y={70} label={`r=${r}Ω int.`} color="#f59e0b"/>
      <WP points={[[250,70],[350,70],[350,160],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={115} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,87]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,143],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <rect x={60} y={46} width={290} height={20} rx={4} fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth={1}/>
      <Lbl x={205} y={60} text="⚠ SHORT CIRCUIT — EXTREMELY DANGEROUS" color="#ef4444" size={10}/>
      <Lbl x={205} y={198} text={`I=${fmtA(I)} — limited only by internal resistance`} color="#ef4444"/>
    </svg>
  );
  const gd=Array.from({length:20},(_,i)=>({x:0.1+i*0.25,y:V/(0.1+i*0.25)}));
  const meas=[{l:"Current",v:fmtA(I),c:"#ef4444"},{l:"Heat power",v:fmtW(I*I*r),c:"#f59e0b"},{l:"Status",v:"DANGER",c:"#ef4444"}];
  const eq=[{s:"I=V/r",n:`${V}/${r}=${fmtA(I)} (enormous!)`}];
  const ch={t:`Increase internal resistance r to limit I below 5 A.`,h:`r > V/5 = ${(V/5).toFixed(1)} Ω`,fn:()=>I<5};
  return{diag,meas,eq,gd,xLbl:"r (Ω)",yLbl:"I (A)",ch};
}

function renderSingleBulb(p,simT,run,lp){
  const {V,R1}=p,I=safe(V/R1),P=I*I*R1,br=Math.min(P/2,1),mx=I||0.5;
  const diag=(
    <svg viewBox="0 0 380 210" style={{width:"100%"}}>
      <WP points={[[60,70],[240,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Bulb x={275} y={70} brightness={br} label={`${R1}Ω`}/>
      <WP points={[[310,70],[350,70],[350,160],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={115} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,87]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,143],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={200} y={200} text={`I=${fmtA(I)}  P=${fmtW(P)}`} color="#38bdf8"/>
    </svg>
  );
  const gd=Array.from({length:25},(_,i)=>{const r=5+i*10;return{x:r,y:V*V/r};});
  const meas=[{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"Power",v:fmtW(P),c:"#fde047"},{l:"Energy (60s)",v:fmtJ(P*60),c:"#22c55e"}];
  const eq=[{s:"P=I²R=V²/R",n:`${I.toFixed(2)}²×${R1}=${fmtW(P)}`},{s:"H=Pt",n:`${fmtW(P)}×60s=${fmtJ(P*60)}`}];
  const ch={t:"Find R for maximum brightness at this voltage.",h:"Lower R = more power = brighter (within rated limits).",fn:()=>P>1};
  return{diag,meas,eq,gd,xLbl:"R (Ω)",yLbl:"P (W)",ch};
}

function renderSeriesBulbs(p,simT,run,lp){
  const {V,R1,R2}=p,Rt=R1+R2,I=safe(V/Rt),V1=I*R1,V2=I*R2,mx=I||0.5;
  const b1=Math.min(I*R1/10,1),b2=Math.min(I*R2/10,1);
  const diag=(
    <svg viewBox="0 0 460 210" style={{width:"100%"}}>
      <WP points={[[60,70],[175,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Bulb x={205} y={70} brightness={b1} label={`R₁=${R1}Ω`}/>
      <WP points={[[240,70],[315,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Bulb x={345} y={70} brightness={b2} label={`R₂=${R2}Ω`}/>
      <WP points={[[380,70],[410,70],[410,170],[60,170]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={120} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,92]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,148],[60,170]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={205} y={52} text={`V₁=${fmtV(V1)}`} color="#f59e0b" size={10}/>
      <Lbl x={345} y={52} text={`V₂=${fmtV(V2)}`} color="#f59e0b" size={10}/>
      <Lbl x={235} y={200} text={`Same I=${fmtA(I)} through both`} color="#38bdf8"/>
    </svg>
  );
  const gd=Array.from({length:20},(_,i)=>({x:i*24/19,y:(i*24/19)/Rt}));
  const meas=[{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"V across R₁",v:fmtV(V1),c:"#f59e0b"},{l:"V across R₂",v:fmtV(V2),c:"#f59e0b"},{l:"Rtotal",v:fmtR(Rt),c:"#e2e8f0"}];
  const eq=[{s:"Rt=R₁+R₂",n:`${R1}+${R2}=${Rt} Ω`},{s:"I=V/Rt",n:`${V}/${Rt}=${fmtA(I)}`}];
  const ch={t:"Make both bulbs equally bright.",h:"Set R₁=R₂ for equal voltage drops and brightness.",fn:()=>Math.abs(R1-R2)<0.5};
  return{diag,meas,eq,gd,xLbl:"V (V)",yLbl:"I (A)",ch};
}

function renderParallelBulbs(p,simT,run,lp){
  const {V,R1,R2}=p,I1=safe(V/R1),I2=safe(V/R2),It=I1+I2,mx=It||0.5;
  const b1=Math.min(I1*R1/12,1),b2=Math.min(I2*R2/12,1);
  const diag=(
    <svg viewBox="0 0 400 280" style={{width:"100%"}}>
      <WP points={[[60,70],[340,70]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[340,70],[340,210]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[340,210],[60,210]]} current={It} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={140} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,112]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,168],[60,210]]} current={It} maxI={mx} running={run} lowPerf={lp} reverse/>
      <WP points={[[180,70],[180,110]]} current={I1} maxI={mx} running={run} lowPerf={lp}/>
      <Bulb x={180} y={140} brightness={b1} label={`R₁=${R1}Ω`} rotate={90}/>
      <WP points={[[180,170],[180,210]]} current={I1} maxI={mx} running={run} lowPerf={lp} reverse/>
      <WP points={[[280,70],[280,110]]} current={I2} maxI={mx} running={run} lowPerf={lp}/>
      <Bulb x={280} y={140} brightness={b2} label={`R₂=${R2}Ω`} rotate={90}/>
      <WP points={[[280,170],[280,210]]} current={I2} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Junction x={180} y={70}/><Junction x={280} y={70}/>
      <Junction x={180} y={210}/><Junction x={280} y={210}/>
      <Lbl x={200} y={260} text={`I₁=${fmtA(I1)}  I₂=${fmtA(I2)}  Both: V=${fmtV(V)}`} color="#38bdf8" size={11}/>
    </svg>
  );
  const gd=Array.from({length:20},(_,i)=>({x:i*24/19,y:(i*24/19)*(1/R1+1/R2)}));
  const meas=[{l:"I₁",v:fmtA(I1),c:"#38bdf8"},{l:"I₂",v:fmtA(I2),c:"#38bdf8"},{l:"Itotal",v:fmtA(It),c:"#38bdf8"},{l:"V (both)",v:fmtV(V),c:"#f59e0b"}];
  const eq=[{s:"Each branch: V same",n:`${V} V`},{s:"Itotal=I₁+I₂",n:`${fmtA(I1)}+${fmtA(I2)}=${fmtA(It)}`}];
  const ch={t:`Set R₁=R₂ so both branches carry equal current.`,h:"Equal parallel resistors share current equally.",fn:()=>Math.abs(I1-I2)<0.05};
  return{diag,meas,eq,gd,xLbl:"V (V)",yLbl:"Itotal (A)",ch};
}

function renderMixedSP(p,simT,run,lp){
  const {V,R1,R2,R3}=p,Rp=calcParR(R2,R3),Rt=R1+Rp,It=safe(V/Rt);
  const V1=It*R1,Vp=It*Rp,I2=safe(Vp/R2),I3=safe(Vp/R3),mx=It||0.5;
  const diag=(
    <svg viewBox="0 0 480 270" style={{width:"100%"}}>
      <WP points={[[60,70],[140,70]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={165} y={70} label={`R₁=${R1}Ω`}/>
      <WP points={[[200,70],[280,70]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[280,70],[280,95]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[280,95],[230,95]]} current={I2} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[230,95],[230,185]]} current={I2} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={230} y={140} label={`R₂=${R2}Ω`} rotate={90}/>
      <WP points={[[230,185],[280,185]]} current={I2} maxI={mx} running={run} lowPerf={lp} reverse/>
      <WP points={[[280,95],[330,95]]} current={I3} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[330,95],[330,185]]} current={I3} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={330} y={140} label={`R₃=${R3}Ω`} rotate={90}/>
      <WP points={[[330,185],[280,185]]} current={I3} maxI={mx} running={run} lowPerf={lp} reverse/>
      <WP points={[[280,185],[280,210]]} current={It} maxI={mx} running={run} lowPerf={lp} reverse/>
      <WP points={[[280,210],[60,210]]} current={It} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={140} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,112]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,168],[60,210]]} current={It} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Junction x={280} y={95}/><Junction x={280} y={185}/>
      <Lbl x={165} y={52} text={`V₁=${fmtV(V1)}`} color="#f59e0b" size={10}/>
      <Lbl x={240} y={255} text={`It=${fmtA(It)}  Rt=${fmtR(Rt)}`} color="#38bdf8" size={11}/>
    </svg>
  );
  const gd=Array.from({length:20},(_,i)=>({x:1+i*2,y:V/(i*2+1+Rp)}));
  const meas=[{l:"Itotal",v:fmtA(It),c:"#38bdf8"},{l:"V across R₁",v:fmtV(V1),c:"#f59e0b"},{l:"V parallel",v:fmtV(Vp),c:"#f59e0b"},{l:"I₂",v:fmtA(I2),c:"#a1a1aa"},{l:"I₃",v:fmtA(I3),c:"#a1a1aa"},{l:"Rtotal",v:fmtR(Rt),c:"#e2e8f0"}];
  const eq=[{s:"R₂‖R₃=R₂R₃/(R₂+R₃)",n:`${R2}×${R3}/(${R2}+${R3})=${Rp.toFixed(2)} Ω`},{s:"Rt=R₁+R₂‖R₃",n:`${R1}+${Rp.toFixed(2)}=${Rt.toFixed(2)} Ω`},{s:"It=V/Rt",n:`${V}/${Rt.toFixed(2)}=${fmtA(It)}`}];
  const ch={t:"Adjust R₁ to give exactly 1.5 A total.",h:`R₁ = V/1.5 − Rp = ${(V/1.5-Rp).toFixed(2)} Ω`,fn:()=>Math.abs(It-1.5)<0.08};
  return{diag,meas,eq,gd,xLbl:"R₁ (Ω)",yLbl:"It (A)",ch};
}

function renderCapCharge(p,simT,run,lp){
  const {V,R1,C}=p,Cf=C*1e-6,tau=R1*Cf,Vc=V*(1-Math.exp(-simT/tau)),Ic=(V/R1)*Math.exp(-simT/tau),E=0.5*Cf*Vc*Vc,mx=V/R1;
  const cl=Vc/V;
  const diag=(
    <svg viewBox="0 0 420 220" style={{width:"100%"}}>
      <WP points={[[60,70],[180,70]]} current={Ic} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={205} y={70} label={`R=${R1}Ω`}/>
      <WP points={[[235,70],[305,70]]} current={Ic} maxI={mx} running={run} lowPerf={lp}/>
      <Capacitor x={325} y={70} label={`C=${C}μF`}/>
      <rect x={314} y={30} width={22} height={14} rx={2} fill="none" stroke="#38bdf8" strokeWidth={1}/>
      <rect x={314} y={30} width={22*cl} height={14} rx={2} fill="#38bdf8" opacity={0.55}/>
      <Lbl x={325} y={22} text={`${(cl*100).toFixed(0)}%`} color="#38bdf8" size={9}/>
      <WP points={[[345,70],[380,70],[380,160],[60,160]]} current={Ic} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={115} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,87]]} current={Ic} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,143],[60,160]]} current={Ic} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={220} y={205} text={`Vc=${Vc.toFixed(2)}V  I=${fmtA(Ic)}  τ=${(tau*1000).toFixed(0)}ms`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:50},(_,i)=>{const t=i/49*tau*5;return{x:t*1000,y:V*(1-Math.exp(-t/tau))};});
  const gd2=Array.from({length:50},(_,i)=>{const t=i/49*tau*5;return{x:t*1000,y:(V/R1)*Math.exp(-t/tau)*1000};});
  const meas=[{l:"Vc",v:fmtV(Vc),c:"#38bdf8"},{l:"Current",v:fmtA(Ic),c:"#f59e0b"},{l:"τ=RC",v:`${(tau*1000).toFixed(1)} ms`,c:"#e2e8f0"},{l:"Energy",v:fmtJ(E),c:"#22c55e"},{l:"Charge %",v:`${(cl*100).toFixed(1)}%`,c:"#a1a1aa"}];
  const eq=[{s:"τ=RC",n:`${R1}×${C}μF=${(tau*1000).toFixed(1)} ms`},{s:"Vc(t)=V(1−e^(−t/τ))",n:`${V}(1−e^(−${(simT/tau).toFixed(2)}))=${Vc.toFixed(2)} V`},{s:"I(t)=(V/R)e^(−t/τ)",n:`${fmtA(Ic)}`}];
  const ch={t:"Change R or C to make τ exactly 5 ms.",h:"τ=RC. Try R=50Ω, C=100μF.",fn:()=>Math.abs(tau*1000-5)<0.5};
  return{diag,meas,eq,gd,gd2,xLbl:"t (ms)",yLbl:"Vc (V)",yLbl2:"I (mA)",ch,useSimT:true,tauMs:tau*1000};
}

function renderCapDischarge(p,simT,run,lp){
  const {V0,R1,C}=p,Cf=C*1e-6,tau=R1*Cf,Vc=V0*Math.exp(-simT/tau),Ic=-(V0/R1)*Math.exp(-simT/tau),mx=V0/R1;
  const cl=Vc/V0;
  const diag=(
    <svg viewBox="0 0 380 210" style={{width:"100%"}}>
      <WP points={[[80,70],[200,70]]} current={Math.abs(Ic)} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Resistor x={220} y={70} label={`R=${R1}Ω`}/>
      <WP points={[[245,70],[295,70]]} current={Math.abs(Ic)} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Capacitor x={315} y={70} label={`C=${C}μF`}/>
      <rect x={304} y={30} width={22} height={14} rx={2} fill="none" stroke="#38bdf8" strokeWidth={1}/>
      <rect x={304} y={30} width={22*cl} height={14} rx={2} fill="#38bdf8" opacity={0.55}/>
      <WP points={[[335,70],[360,70],[360,160],[80,160],[80,70]]} current={Math.abs(Ic)} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={220} y={200} text={`Vc=${Vc.toFixed(2)}V  τ=${(tau*1000).toFixed(0)}ms`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:50},(_,i)=>{const t=i/49*tau*5;return{x:t*1000,y:V0*Math.exp(-t/tau)};});
  const meas=[{l:"Vc",v:fmtV(Vc),c:"#38bdf8"},{l:"Discharge I",v:fmtA(Math.abs(Ic)),c:"#f59e0b"},{l:"τ",v:`${(tau*1000).toFixed(1)} ms`,c:"#e2e8f0"},{l:"Energy left",v:fmtJ(0.5*Cf*Vc*Vc),c:"#22c55e"}];
  const eq=[{s:"Vc(t)=V₀e^(−t/τ)",n:`${V0}×e^(−${(simT/tau).toFixed(2)})=${Vc.toFixed(2)} V`}];
  const ch={t:"Set τ=RC so capacitor reaches 37% at t=10 ms.",h:"τ=10ms → e.g. R=100Ω, C=100μF.",fn:()=>Math.abs(tau*1000-10)<1};
  return{diag,meas,eq,gd,xLbl:"t (ms)",yLbl:"Vc (V)",ch,useSimT:true,tauMs:tau*1000};
}

function renderCapsSeries(p,simT,run,lp){
  const {V,C1,C2,C3}=p,Ct=calcCapSer(C1*1e-6,C2*1e-6,C3*1e-6),Q=Ct*V,V1=Q/(C1*1e-6),V2=Q/(C2*1e-6),V3=Q/(C3*1e-6);
  const diag=(
    <svg viewBox="0 0 480 190" style={{width:"100%"}}>
      <Wire x1={60} y1={80} x2={130} y2={80} stroke="#e2e8f0" sw={2.5}/>
      <Capacitor x={150} y={80} label={`C₁=${C1}μF`}/>
      <Wire x1={170} y1={80} x2={240} y2={80} stroke="#e2e8f0" sw={2.5}/>
      <Capacitor x={260} y={80} label={`C₂=${C2}μF`}/>
      <Wire x1={280} y1={80} x2={350} y2={80} stroke="#e2e8f0" sw={2.5}/>
      <Capacitor x={370} y={80} label={`C₃=${C3}μF`}/>
      <Wire x1={390} y1={80} x2={420} y2={80} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={420} y1={80} x2={420} y2={160} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={420} y1={160} x2={60} y2={160} stroke="#e2e8f0" sw={2.5}/>
      <Battery x={60} y={120} label={`${V}V`} rotate={90}/>
      <Wire x1={60} y1={80} x2={60} y2={92} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={60} y1={148} x2={60} y2={160} stroke="#e2e8f0" sw={2.5}/>
      <Lbl x={150} y={64} text={`V₁=${fmtV(V1)}`} color="#f59e0b" size={9}/>
      <Lbl x={260} y={64} text={`V₂=${fmtV(V2)}`} color="#f59e0b" size={9}/>
      <Lbl x={370} y={64} text={`V₃=${fmtV(V3)}`} color="#f59e0b" size={9}/>
      <Lbl x={240} y={180} text={`Ctotal=${fmtF(Ct)}  Q=${(Q*1e6).toFixed(2)}μC`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:20},(_,i)=>({x:i*50+50,y:calcCapSer((i*50+50)*1e-6,C2*1e-6,C3*1e-6)*1e6}));
  const meas=[{l:"Ctotal",v:fmtF(Ct),c:"#38bdf8"},{l:"Charge Q",v:`${(Q*1e6).toFixed(2)} μC`,c:"#f59e0b"},{l:"V₁",v:fmtV(V1),c:"#a1a1aa"},{l:"V₂",v:fmtV(V2),c:"#a1a1aa"},{l:"V₃",v:fmtV(V3),c:"#a1a1aa"}];
  const eq=[{s:"1/Ct=1/C₁+1/C₂+1/C₃",n:`Ct=${fmtF(Ct)}`},{s:"Q=CtV (same each)",n:`${(Q*1e6).toFixed(2)} μC`}];
  const ch={t:"Set C₁=C₂=C₃=100μF. What is total capacitance?",h:"Series equal caps: Ct=C/3=33.3μF.",fn:()=>Math.abs(Ct*1e6-33.3)<2};
  return{diag,meas,eq,gd,xLbl:"C₁ (μF)",yLbl:"Ctotal (μF)",ch};
}

function renderCapsParallel(p,simT,run,lp){
  const {V,C1,C2,C3}=p,Ct=(C1+C2+C3)*1e-6,Q=Ct*V;
  const diag=(
    <svg viewBox="0 0 400 280" style={{width:"100%"}}>
      <Wire x1={60} y1={70} x2={340} y2={70} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={340} y1={70} x2={340} y2={220} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={340} y1={220} x2={60} y2={220} stroke="#e2e8f0" sw={2.5}/>
      <Battery x={60} y={145} label={`${V}V`} rotate={90}/>
      <Wire x1={60} y1={70} x2={60} y2={117} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={60} y1={173} x2={60} y2={220} stroke="#e2e8f0" sw={2.5}/>
      <Capacitor x={160} y={145} label={`C₁=${C1}μF`} rotate={90}/>
      <Capacitor x={240} y={145} label={`C₂=${C2}μF`} rotate={90}/>
      <Capacitor x={320} y={145} label={`C₃=${C3}μF`} rotate={90}/>
      <Junction x={160} y={70}/><Junction x={240} y={70}/><Junction x={320} y={70}/>
      <Junction x={160} y={220}/><Junction x={240} y={220}/><Junction x={320} y={220}/>
      <Lbl x={200} y={265} text={`Ctotal=${fmtF(Ct)}  Q=${(Q*1e6).toFixed(0)}μC`} color="#38bdf8" size={11}/>
    </svg>
  );
  const gd=Array.from({length:20},(_,i)=>({x:i*100,y:(C1*1e-6+i*100e-6+C3*1e-6)*1e6}));
  const meas=[{l:"Ctotal",v:fmtF(Ct),c:"#38bdf8"},{l:"Total Q",v:`${(Q*1e6).toFixed(0)} μC`,c:"#f59e0b"},{l:"V each",v:fmtV(V),c:"#a1a1aa"}];
  const eq=[{s:"Ct=C₁+C₂+C₃",n:`${C1}+${C2}+${C3}=${(Ct*1e6).toFixed(0)} μF`}];
  const ch={t:"Set C₁=C₂=C₃=200μF to get Ctotal=600μF.",h:"Parallel caps simply add.",fn:()=>Math.abs(Ct*1e6-600)<5};
  return{diag,meas,eq,gd,xLbl:"C₂ (μF)",yLbl:"Ct (μF)",ch};
}

function renderRLGrowth(p,simT,run,lp){
  const {V,R1,L}=p,Lh=L*1e-3,tau=Lh/R1,Im=safe(V/R1),I=Im*(1-Math.exp(-simT/tau)),VL=V-I*R1,mx=Im||0.2;
  const diag=(
    <svg viewBox="0 0 420 210" style={{width:"100%"}}>
      <WP points={[[60,70],[175,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={200} y={70} label={`R=${R1}Ω`}/>
      <WP points={[[230,70],[305,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Inductor x={330} y={70} label={`L=${L}mH`}/>
      <WP points={[[360,70],[380,70],[380,160],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={115} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,87]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,143],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      {/* Energy bar */}
      <rect x={160} y={95} width={100} height={10} rx={3} fill="none" stroke="#a1a1aa" strokeWidth={1}/>
      <rect x={160} y={95} width={100*(I/Im)} height={10} rx={3} fill="#f59e0b"/>
      <Lbl x={210} y={125} text={`E=½LI²=${fmtJ(0.5*Lh*I*I)}`} color="#f59e0b" size={9}/>
      <Lbl x={220} y={200} text={`I=${fmtA(I)}  Im=${fmtA(Im)}  τ=${(tau*1000).toFixed(1)}ms`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:50},(_,i)=>{const t=i/49*tau*5;return{x:t*1000,y:Im*(1-Math.exp(-t/tau))};});
  const meas=[{l:"I(t)",v:fmtA(I),c:"#38bdf8"},{l:"I max",v:fmtA(Im),c:"#a1a1aa"},{l:"VL",v:fmtV(VL),c:"#f59e0b"},{l:"τ=L/R",v:`${(tau*1000).toFixed(2)} ms`,c:"#e2e8f0"},{l:"Energy",v:fmtJ(0.5*Lh*I*I),c:"#22c55e"}];
  const eq=[{s:"τ=L/R",n:`${L}mH/${R1}Ω=${(tau*1000).toFixed(2)} ms`},{s:"I(t)=(V/R)(1−e^(−tR/L))",n:`${fmtA(Im)}(1−e^(−${(simT/tau).toFixed(2)}))=${fmtA(I)}`}];
  const ch={t:"Reach 90% of max current in under 5ms.",h:"2.3τ = time for 90%. Need τ < 2.2ms.",fn:()=>tau*1000<2.2};
  return{diag,meas,eq,gd,xLbl:"t (ms)",yLbl:"I (A)",ch,useSimT:true,tauMs:tau*1000};
}

function renderInductorEnergy(p,simT,run,lp){
  const {V,R1,L}=p,Lh=L*1e-3,tau=Lh/R1,Im=safe(V/R1),I=Im*(1-Math.exp(-simT/tau)),E=0.5*Lh*I*I,mx=Im||0.2;
  const diag=(
    <svg viewBox="0 0 380 210" style={{width:"100%"}}>
      <WP points={[[60,70],[150,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={175} y={70} label={`R=${R1}Ω`}/>
      <WP points={[[205,70],[280,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Inductor x={310} y={70} label={`L=${L}mH`}/>
      <WP points={[[340,70],[360,70],[360,160],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={115} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,87]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,143],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <rect x={130} y={100} width={100} height={12} rx={3} fill="none" stroke="#a1a1aa" strokeWidth={1}/>
      <rect x={130} y={100} width={100*(I/Im)} height={12} rx={3} fill="#f59e0b"/>
      <Lbl x={180} y={200} text={`E=½LI²=${fmtJ(E)}`} color="#f59e0b"/>
    </svg>
  );
  const gd=Array.from({length:30},(_,i)=>{const t=i/29*tau*5,ii=Im*(1-Math.exp(-t/tau));return{x:t*1000,y:0.5*Lh*ii*ii*1000};});
  const meas=[{l:"I(t)",v:fmtA(I),c:"#38bdf8"},{l:"I max",v:fmtA(Im),c:"#a1a1aa"},{l:"Energy E",v:fmtJ(E),c:"#f59e0b"},{l:"τ",v:`${(tau*1000).toFixed(1)} ms`,c:"#e2e8f0"}];
  const eq=[{s:"E=½LI²",n:`½×${L}mH×${I.toFixed(2)}²=${fmtJ(E)}`}];
  const ch={t:"Store at least 10 mJ in the inductor.",h:`E=½×${L/1000}×Im². Im=${Im.toFixed(2)}A → E=${(0.5*Lh*Im*Im*1000).toFixed(1)}mJ`,fn:()=>E*1000>=10};
  return{diag,meas,eq,gd,xLbl:"t (ms)",yLbl:"E (mJ)",ch,useSimT:true,tauMs:tau*1000};
}

function renderWheatstone(p,simT,run,lp){
  const {V,R1,R2,R3,R4}=p;
  const bal=Math.abs(R1/R2-R3/R4)<0.01,VA=V*R3/(R1+R3),VB=V*R4/(R2+R4),Vg=VA-VB;
  const It=V/(R1+R3),Ib=V/(R2+R4),mx=Math.max(It,Ib)*1.5||0.5;
  const diag=(
    <svg viewBox="0 0 420 280" style={{width:"100%"}}>
      <WP points={[[60,140],[170,80]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[210,56],[330,80]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,140],[170,200]]} current={Ib} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[210,224],[330,200]]} current={Ib} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[330,80],[330,200]]} current={It} maxI={mx} running={run} lowPerf={lp}/>
      <Wire x1={170} y1={80} x2={170} y2={200} stroke="#e2e8f0" sw={1.5}/>
      <Resistor x={190} y={68} label={`R₁=${R1}`} rotate={-25}/>
      <Resistor x={190} y={212} label={`R₂=${R2}`} rotate={25}/>
      <Resistor x={330} y={110} label={`R₃=${R3}`} rotate={90}/>
      <Resistor x={330} y={170} label={`R₄=${R4}`} rotate={90}/>
      <circle cx={170} cy={140} r={14} fill="#222326" stroke={bal?"#22c55e":"#f59e0b"} strokeWidth={2}/>
      <text x={170} y={144} fill={bal?"#22c55e":"#f59e0b"} fontSize={10} textAnchor="middle">G</text>
      <Battery x={60} y={140} label={`${V}V`} rotate={90}/>
      <Wire x1={60} y1={80} x2={60} y2={112} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={60} y1={168} x2={60} y2={200} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={60} y1={80} x2={170} y2={80} stroke="#e2e8f0" sw={1} strokeDasharray="4,2"/>
      <Wire x1={60} y1={200} x2={170} y2={200} stroke="#e2e8f0" sw={1} strokeDasharray="4,2"/>
      <Lbl x={210} y={268} text={bal?`BALANCED: Vg=0`:`Vg=${Vg.toFixed(2)}V`} color={bal?"#22c55e":"#f59e0b"}/>
    </svg>
  );
  const gd=Array.from({length:25},(_,i)=>{const r3=50+i*10;return{x:r3,y:V*r3/(R1+r3)-V*R4/(R2+R4)};});
  const meas=[{l:"Balance",v:bal?"BALANCED":"UNBALANCED",c:bal?"#22c55e":"#ef4444"},{l:"Vg",v:fmtV(Vg),c:"#f59e0b"},{l:"VA",v:fmtV(VA),c:"#a1a1aa"},{l:"VB",v:fmtV(VB),c:"#a1a1aa"}];
  const eq=[{s:"Balance: R₁/R₂=R₃/R₄",n:`${(R1/R2).toFixed(2)} ${bal?"=":"≠"} ${(R3/R4).toFixed(2)}`},{s:"Vg=VA−VB",n:`${VA.toFixed(2)}−${VB.toFixed(2)}=${Vg.toFixed(2)} V`}];
  const ch={t:"Balance the bridge (Vg=0) by adjusting R₃.",h:`R₃ = R₁/R₂×R₄ = ${(R1/R2*R4).toFixed(0)} Ω`,fn:()=>bal};
  return{diag,meas,eq,gd,xLbl:"R₃ (Ω)",yLbl:"Vg (V)",ch};
}

function renderACResistor(p,simT,run,lp){
  const {Vpeak,f,R1}=p,Vrms=Vpeak/Math.sqrt(2),Irms=safe(Vrms/R1),Ipk=safe(Vpeak/R1);
  const Vi=Vpeak*Math.sin(2*Math.PI*f*simT),Ii=Vi/R1,mx=Ipk||0.5;
  const diag=(
    <svg viewBox="0 0 400 210" style={{width:"100%"}}>
      <WP points={[[60,70],[190,70]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse={Ii<0}/>
      <Resistor x={215} y={70} label={`R=${R1}Ω`}/>
      <WP points={[[245,70],[360,70],[360,160],[60,160]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse={Ii>=0}/>
      <ACSource x={60} y={115} label={`${Vpeak}Vp,${f}Hz`} rotate={90}/>
      <WP points={[[60,70],[60,87]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,143],[60,160]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={210} y={200} text={`Vrms=${Vrms.toFixed(1)}V  Irms=${fmtA(Irms)}  P=${fmtW(Vrms*Irms)}`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:60},(_,i)=>{const t=i/59*(3/f);return{x:t*1000,y:Vpeak*Math.sin(2*Math.PI*f*t)};});
  const gd2=Array.from({length:60},(_,i)=>{const t=i/59*(3/f);return{x:t*1000,y:(Vpeak*Math.sin(2*Math.PI*f*t)/R1)*1000};});
  const meas=[{l:"Vrms",v:fmtV(Vrms),c:"#38bdf8"},{l:"Irms",v:fmtA(Irms),c:"#f59e0b"},{l:"Pavg",v:fmtW(Vrms*Irms),c:"#22c55e"},{l:"Phase",v:"0°",c:"#a1a1aa"}];
  const eq=[{s:"Vrms=Vpeak/√2",n:`${Vpeak}/√2=${Vrms.toFixed(2)} V`},{s:"Irms=Vrms/R",n:`${Vrms.toFixed(2)}/${R1}=${fmtA(Irms)}`}];
  const ch={t:"Set R to make Irms exactly 1 A.",h:`R = Vrms = ${Vrms.toFixed(1)} Ω`,fn:()=>Math.abs(Irms-1)<0.05};
  return{diag,meas,eq,gd,gd2,xLbl:"t (ms)",yLbl:"V (V)",yLbl2:"I (mA)",ch,useSimT:true};
}

function renderACCap(p,simT,run,lp){
  const {Vpeak,f,C}=p,Cf=C*1e-6,Xc=xcap(f,Cf),Vrms=Vpeak/Math.sqrt(2),Irms=safe(Vrms/Xc),Ipk=Irms*Math.sqrt(2);
  const Vi=Vpeak*Math.sin(2*Math.PI*f*simT),Ii=Ipk*Math.sin(2*Math.PI*f*simT+Math.PI/2),mx=Ipk||0.5;
  const diag=(
    <svg viewBox="0 0 380 210" style={{width:"100%"}}>
      <WP points={[[60,70],[190,70]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse={Ii<0}/>
      <Capacitor x={210} y={70} label={`C=${C}μF`}/>
      <WP points={[[230,70],[350,70],[350,160],[60,160]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse={Ii>=0}/>
      <ACSource x={60} y={115} label={`${Vpeak}Vp`} rotate={90}/>
      <WP points={[[60,70],[60,87]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,143],[60,160]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={200} y={200} text={`Xc=${fmtR(Xc)}  Irms=${fmtA(Irms)}  I leads V 90°`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:60},(_,i)=>{const t=i/59*(3/f);return{x:t*1000,y:Vpeak*Math.sin(2*Math.PI*f*t)};});
  const gd2=Array.from({length:60},(_,i)=>{const t=i/59*(3/f);return{x:t*1000,y:Ipk*Math.sin(2*Math.PI*f*t+Math.PI/2)*1000};});
  const meas=[{l:"Xc",v:fmtR(Xc),c:"#38bdf8"},{l:"Irms",v:fmtA(Irms),c:"#f59e0b"},{l:"Phase",v:"I leads 90°",c:"#22c55e"},{l:"Avg Power",v:"0 W (ideal)",c:"#a1a1aa"}];
  const eq=[{s:"Xc=1/(2πfC)",n:`1/(2π×${f}×${C}μF)=${Xc.toFixed(1)} Ω`},{s:"Irms=Vrms/Xc",n:`${Vrms.toFixed(1)}/${Xc.toFixed(1)}=${fmtA(Irms)}`}];
  const ch={t:"Double the frequency. How does Xc change?",h:"Xc halves when f doubles (inversely proportional).",fn:()=>f>=100};
  return{diag,meas,eq,gd,gd2,xLbl:"t (ms)",yLbl:"V (V)",yLbl2:"I (mA)",ch,useSimT:true};
}

function renderACInd(p,simT,run,lp){
  const {Vpeak,f,L}=p,Lh=L*1e-3,XL=xind(f,Lh),Vrms=Vpeak/Math.sqrt(2),Irms=safe(Vrms/XL),Ipk=Irms*Math.sqrt(2);
  const Vi=Vpeak*Math.sin(2*Math.PI*f*simT),Ii=Ipk*Math.sin(2*Math.PI*f*simT-Math.PI/2),mx=Ipk||0.5;
  const diag=(
    <svg viewBox="0 0 380 210" style={{width:"100%"}}>
      <WP points={[[60,70],[190,70]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse={Ii<0}/>
      <Inductor x={215} y={70} label={`L=${L}mH`}/>
      <WP points={[[250,70],[350,70],[350,160],[60,160]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse={Ii>=0}/>
      <ACSource x={60} y={115} label={`${Vpeak}Vp`} rotate={90}/>
      <WP points={[[60,70],[60,87]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,143],[60,160]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={200} y={200} text={`XL=${fmtR(XL)}  Irms=${fmtA(Irms)}  I lags V 90°`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:60},(_,i)=>{const t=i/59*(3/f);return{x:t*1000,y:Vpeak*Math.sin(2*Math.PI*f*t)};});
  const gd2=Array.from({length:60},(_,i)=>{const t=i/59*(3/f);return{x:t*1000,y:Ipk*Math.sin(2*Math.PI*f*t-Math.PI/2)*1000};});
  const meas=[{l:"XL",v:fmtR(XL),c:"#38bdf8"},{l:"Irms",v:fmtA(Irms),c:"#f59e0b"},{l:"Phase",v:"I lags 90°",c:"#22c55e"},{l:"Avg Power",v:"0 W (ideal)",c:"#a1a1aa"}];
  const eq=[{s:"XL=2πfL",n:`2π×${f}×${L}mH=${XL.toFixed(1)} Ω`},{s:"Irms=Vrms/XL",n:`${Vrms.toFixed(1)}/${XL.toFixed(1)}=${fmtA(Irms)}`}];
  const ch={t:"Double the frequency. How does XL change?",h:"XL doubles when f doubles (directly proportional).",fn:()=>f>=100};
  return{diag,meas,eq,gd,gd2,xLbl:"t (ms)",yLbl:"V (V)",yLbl2:"I (mA)",ch,useSimT:true};
}

function renderSeriesRLC(p,simT,run,lp){
  const {Vpeak,f,R1,L,C}=p,Cf=C*1e-6,Lh=L*1e-3;
  const Vrms=Vpeak/Math.sqrt(2),XL=xind(f,Lh),XC=xcap(f,Cf),Z=zlrc(R1,XL,XC);
  const Irms=safe(Vrms/Z),phi=Math.atan2(XL-XC,R1)*180/Math.PI,PF=safe(R1/Z),f0=resF(Lh,Cf);
  const phiR=phi*Math.PI/180,Ipk=Irms*Math.sqrt(2),mx=Ipk||0.5;
  const Ii=Ipk*Math.sin(2*Math.PI*f*simT-phiR),Vi=Vpeak*Math.sin(2*Math.PI*f*simT);
  const diag=(
    <svg viewBox="0 0 480 210" style={{width:"100%"}}>
      <WP points={[[60,70],[140,70]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse={Ii<0}/>
      <Resistor x={165} y={70} label={`R=${R1}Ω`}/>
      <WP points={[[195,70],[255,70]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse={Ii<0}/>
      <Inductor x={280} y={70} label={`L=${L}mH`}/>
      <WP points={[[310,70],[355,70]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse={Ii<0}/>
      <Capacitor x={375} y={70} label={`C=${C}μF`}/>
      <WP points={[[395,70],[430,70],[430,160],[60,160]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse={Ii>=0}/>
      <ACSource x={60} y={115} label={`${Vpeak}Vp`} rotate={90}/>
      <WP points={[[60,70],[60,87]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,143],[60,160]]} current={Math.abs(Ii)} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={245} y={198} text={`Z=${fmtR(Z)} φ=${phi.toFixed(1)}° f₀=${fmtHz(f0)}`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:60},(_,i)=>{const t=i/59*(3/f);return{x:t*1000,y:Vpeak*Math.sin(2*Math.PI*f*t)};});
  const gd2=Array.from({length:60},(_,i)=>{const t=i/59*(3/f);return{x:t*1000,y:Ipk*Math.sin(2*Math.PI*f*t-phiR)*10};});
  const meas=[{l:"Z",v:fmtR(Z),c:"#e2e8f0"},{l:"Irms",v:fmtA(Irms),c:"#38bdf8"},{l:"XL",v:fmtR(XL),c:"#f59e0b"},{l:"XC",v:fmtR(XC),c:"#a1a1aa"},{l:"φ",v:`${phi.toFixed(1)}°`,c:"#22c55e"},{l:"PF",v:PF.toFixed(3),c:"#22c55e"},{l:"f₀",v:fmtHz(f0),c:"#38bdf8"}];
  const eq=[{s:"XL=2πfL",n:`${XL.toFixed(1)} Ω`},{s:"XC=1/(2πfC)",n:`${XC.toFixed(1)} Ω`},{s:"Z=√(R²+(XL−XC)²)",n:`${Z.toFixed(2)} Ω`},{s:"f₀=1/(2π√(LC))",n:`${fmtHz(f0)}`}];
  const ch={t:`Tune f to resonance so Z=R=${R1}Ω.`,h:`f₀=${fmtHz(f0)}`,fn:()=>Math.abs(f-f0)<f0*0.05};
  return{diag,meas,eq,gd,gd2,xLbl:"t (ms)",yLbl:"V (V)",yLbl2:"I×10(mA)",ch,useSimT:true};
}

function renderDiodeFwd(p,simT,run,lp){
  const {V,R1}=p,Vf=0.7,I=V>Vf?safe((V-Vf)/R1):0,mx=I||0.05;
  const diag=(
    <svg viewBox="0 0 380 210" style={{width:"100%"}}>
      <WP points={[[60,70],[170,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={195} y={70} label={`R=${R1}Ω`}/>
      <WP points={[[225,70],[280,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Diode x={305} y={70} label="0.7V"/>
      <WP points={[[325,70],[360,70],[360,160],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={115} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,87]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,143],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={200} y={200} text={`I=${fmtA(I)}  (simplified silicon model)`} color="#22c55e"/>
    </svg>
  );
  const gd=Array.from({length:25},(_,i)=>{const v=i*0.25;return{x:v,y:v>0.7?(v-0.7)/R1*1000:0};});
  const meas=[{l:"Forward I",v:fmtA(I),c:"#22c55e"},{l:"Diode drop",v:"0.7 V",c:"#f59e0b"},{l:"V across R",v:fmtV(I*R1),c:"#a1a1aa"}];
  const eq=[{s:"I=(V−Vf)/R",n:`(${V}−0.7)/${R1}=${fmtA(I)}`}];
  const ch={t:"Set V to give exactly 10 mA.",h:`V = 0.7+0.01×${R1}=${(0.7+0.01*R1).toFixed(2)} V`,fn:()=>Math.abs(I*1000-10)<1};
  return{diag,meas,eq,gd,xLbl:"V (V)",yLbl:"I (mA)",ch};
}

function renderDiodeRev(p,simT,run,lp){
  const {V,R1}=p;
  const diag=(
    <svg viewBox="0 0 380 210" style={{width:"100%"}}>
      <Wire x1={60} y1={70} x2={175} y2={70} stroke="#e2e8f0" sw={2.5}/>
      <Resistor x={200} y={70} label={`R=${R1}Ω`}/>
      <Wire x1={230} y1={70} x2={285} y2={70} stroke="#e2e8f0" sw={2.5}/>
      <Diode x={305} y={70} label="REV" rotate={180}/>
      <Wire x1={325} y1={70} x2={360} y2={70} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={360} y1={70} x2={360} y2={160} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={360} y1={160} x2={60} y2={160} stroke="#e2e8f0" sw={2.5}/>
      <Battery x={60} y={115} label={`${V}V`} rotate={90}/>
      <Wire x1={60} y1={70} x2={60} y2={87} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={60} y1={143} x2={60} y2={160} stroke="#e2e8f0" sw={2.5}/>
      <Lbl x={200} y={200} text="I ≈ 0 (reverse biased — diode blocks)" color="#ef4444"/>
    </svg>
  );
  const gd=[{x:-V,y:0.000001},{x:0,y:0.000001},{x:0.5,y:0},{x:0.7,y:100}];
  const meas=[{l:"Current",v:"≈ 0 A",c:"#ef4444"},{l:"Block voltage",v:fmtV(V),c:"#f59e0b"},{l:"Status",v:"BLOCKING",c:"#ef4444"}];
  const eq=[{s:"Reverse bias → I≈0",n:"Depletion region widens; no conventional current."}];
  const ch={t:"Reverse the battery to forward bias the diode.",h:"Forward bias: anode positive relative to cathode.",fn:()=>false};
  return{diag,meas,eq,gd,xLbl:"V (V)",yLbl:"I (μA)",ch};
}

function renderLEDCircuit(p,simT,run,lp){
  const {V,R1,Vf}=p,I=V>Vf?safe((V-Vf)/R1):0,br=Math.min(I*50,1),mx=I||0.05;
  const diag=(
    <svg viewBox="0 0 380 210" style={{width:"100%"}}>
      <WP points={[[60,70],[170,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={195} y={70} label={`R=${R1}Ω`}/>
      <WP points={[[225,70],[275,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      {br>0.05&&<circle cx={305} cy={70} r={22} fill="rgba(34,197,94,0.2)"/>}
      <Diode x={305} y={70} led label={`Vf=${Vf}V`}/>
      <WP points={[[325,70],[360,70],[360,160],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={115} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,87]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,143],[60,160]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={200} y={200} text={`If=${fmtA(I)}  Vled=${fmtV(Vf)}  VR=${fmtV(I*R1)}`} color="#22c55e"/>
    </svg>
  );
  const gd=Array.from({length:20},(_,i)=>{const v=1.5+i*0.25;return{x:v,y:v>Vf?(v-Vf)/R1*1000:0};});
  const meas=[{l:"LED Current",v:fmtA(I),c:"#22c55e"},{l:"LED V drop",v:fmtV(Vf),c:"#f59e0b"},{l:"V across R",v:fmtV(I*R1),c:"#a1a1aa"},{l:"LED Power",v:fmtW(I*Vf),c:"#22c55e"}];
  const eq=[{s:"R=(V−Vf)/If",n:`(${V}−${Vf})/${R1}=${fmtA(I)}`}];
  const ch={t:"Set R for exactly 20 mA through LED.",h:`R=(${V}−${Vf})/0.020=${((V-Vf)/0.02).toFixed(0)}Ω`,fn:()=>Math.abs(I*1000-20)<2};
  return{diag,meas,eq,gd,xLbl:"V (V)",yLbl:"If (mA)",ch};
}

function renderHalfWave(p,simT,run,lp){
  const {Vpeak,f,Rload}=p,Vi=Vpeak*Math.sin(2*Math.PI*f*simT),Vo=Math.max(0,Vi-0.7),Io=Vo/Rload,Vavg=(Vpeak-0.7)/Math.PI,mx=Vpeak/Rload;
  const diag=(
    <svg viewBox="0 0 400 210" style={{width:"100%"}}>
      <WP points={[[60,80],[190,80]]} current={Math.abs(Io)} maxI={mx} running={run} lowPerf={lp} reverse={Vi<0}/>
      <Diode x={215} y={80} label="D₁"/>
      <WP points={[[235,80],[320,80]]} current={Io} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={320} y={130} label={`RL=${Rload}Ω`} rotate={90}/>
      <WP points={[[320,170],[320,190],[60,190],[60,80]]} current={Io} maxI={mx} running={run} lowPerf={lp} reverse/>
      <ACSource x={60} y={135} label={`${Vpeak}Vp`} rotate={90}/>
      <Wire x1={60} y1={80} x2={60} y2={107} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={60} y1={163} x2={60} y2={190} stroke="#e2e8f0" sw={2.5}/>
      <Lbl x={200} y={205} text={`Vout=${Vo.toFixed(2)}V  Vavg=${Vavg.toFixed(2)}V DC`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:60},(_,i)=>{const t=i/59*(3/f);return{x:t*1000,y:Math.max(0,Vpeak*Math.sin(2*Math.PI*f*t)-0.7)};});
  const gd2=Array.from({length:60},(_,i)=>{const t=i/59*(3/f);return{x:t*1000,y:Vpeak*Math.sin(2*Math.PI*f*t)};});
  const meas=[{l:"Vout (inst)",v:fmtV(Vo),c:"#22c55e"},{l:"Vavg (DC)",v:fmtV(Vavg),c:"#38bdf8"},{l:"Efficiency",v:"~40.6%",c:"#a1a1aa"}];
  const eq=[{s:"Vavg=(Vpeak−0.7)/π",n:`(${Vpeak}−0.7)/π=${Vavg.toFixed(2)} V`}];
  const ch={t:"Observe: only positive half-cycles contribute to output.",h:"Half-wave uses 50% of AC cycles.",fn:()=>true};
  return{diag,meas,eq,gd,gd2,xLbl:"t (ms)",yLbl:"Vout (V)",yLbl2:"Vin (V)",ch,useSimT:true};
}

function renderFullWave(p,simT,run,lp){
  const {Vpeak,f,Rload}=p,Vi=Vpeak*Math.sin(2*Math.PI*f*simT),Vo=Math.max(0,Math.abs(Vi)-1.4),Io=Vo/Rload,Vavg=2*(Vpeak-1.4)/Math.PI,mx=Vpeak/Rload;
  const diag=(
    <svg viewBox="0 0 440 230" style={{width:"100%"}}>
      <ACSource x={80} y={115} label={`${Vpeak}Vp`} rotate={90}/>
      <Wire x1={80} y1={70} x2={80} y2={87} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={80} y1={143} x2={80} y2={160} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={80} y1={70} x2={160} y2={70} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={80} y1={160} x2={160} y2={160} stroke="#e2e8f0" sw={2.5}/>
      {/* Bridge diodes */}
      <Diode x={180} y={70} label="D₁"/>
      <Diode x={180} y={160} label="D₂" rotate={180}/>
      <Diode x={280} y={70} label="D₃"/>
      <Diode x={280} y={160} label="D₄" rotate={180}/>
      <Wire x1={200} y1={70} x2={260} y2={70} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={200} y1={160} x2={260} y2={160} stroke="#e2e8f0" sw={2.5}/>
      <WP points={[[300,70],[380,70]]} current={Io} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={380} y={115} label={`RL=${Rload}Ω`} rotate={90}/>
      <WP points={[[380,160],[300,160]]} current={Io} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={240} y={220} text={`Vout=${Vo.toFixed(2)}V  Vavg=${Vavg.toFixed(2)}V`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:60},(_,i)=>{const t=i/59*(3/f);return{x:t*1000,y:Math.max(0,Math.abs(Vpeak*Math.sin(2*Math.PI*f*t))-1.4)};});
  const meas=[{l:"Vout",v:fmtV(Vo),c:"#22c55e"},{l:"Vavg",v:fmtV(Vavg),c:"#38bdf8"},{l:"Ripple freq",v:`${2*f} Hz`,c:"#a1a1aa"}];
  const eq=[{s:"Vavg=2(Vpeak−1.4)/π",n:`=${Vavg.toFixed(2)} V`}];
  const ch={t:"Compare Vavg here vs half-wave. Full-wave should be ~double.",h:"Full-wave uses both half-cycles; Vavg ≈ 2× half-wave.",fn:()=>Vavg>Vpeak*0.5};
  return{diag,meas,eq,gd,xLbl:"t (ms)",yLbl:"Vout (V)",ch,useSimT:true};
}

function renderZenerReg(p,simT,run,lp){
  const {V,Rser,Vz}=p,Vout=Math.min(V,Vz),I=safe((V-Vout)/Rser),Iz=I-(Vout/10000);
  const mx=I||0.05;
  const diag=(
    <svg viewBox="0 0 380 210" style={{width:"100%"}}>
      <WP points={[[60,70],[160,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={185} y={70} label={`Rs=${Rser}Ω`}/>
      <WP points={[[215,70],[280,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Junction x={280} y={70}/>
      <WP points={[[280,70],[280,110]]} current={Iz} maxI={mx} running={run} lowPerf={lp}/>
      <Diode x={280} y={130} label={`Vz=${Vz}V`} zener rotate={90}/>
      <WP points={[[280,160],[280,190],[60,190]]} current={Iz} maxI={mx} running={run} lowPerf={lp} reverse/>
      <WP points={[[280,70],[350,70]]} current={I-Iz} maxI={mx} running={run} lowPerf={lp}/>
      <text x={380} y={74} fill="#22c55e" fontSize={12}>Vout</text>
      <text x={380} y={88} fill="#22c55e" fontSize={11}>{fmtV(Vout)}</text>
      <Battery x={60} y={130} label={`${V}V`} rotate={90}/>
      <Wire x1={60} y1={70} x2={60} y2={102} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={60} y1={158} x2={60} y2={190} stroke="#e2e8f0" sw={2.5}/>
      <Lbl x={200} y={205} text={`Vout=${fmtV(Vout)} (regulated)`} color="#22c55e"/>
    </svg>
  );
  const gd=Array.from({length:20},(_,i)=>{const v=5+i;return{x:v,y:Math.min(v,Vz)};});
  const meas=[{l:"Vout (regulated)",v:fmtV(Vout),c:"#22c55e"},{l:"Zener V",v:fmtV(Vz),c:"#f59e0b"},{l:"Series I",v:fmtA(I),c:"#38bdf8"}];
  const eq=[{s:"Vout = Vz (when V > Vz)",n:`=${fmtV(Vz)}`},{s:"I=(V−Vz)/Rs",n:`(${V}−${Vz})/${Rser}=${fmtA(I)}`}];
  const ch={t:"Set V above Vz and observe regulated output.",h:"When V > Vz, zener clamps Vout = Vz.",fn:()=>V>Vz};
  return{diag,meas,eq,gd,xLbl:"Vin (V)",yLbl:"Vout (V)",ch};
}

function renderLDRCircuit(p,simT,run,lp){
  const {V,Rfixed,Rldr}=p,Rt=Rfixed+Rldr,I=safe(V/Rt),Vout=I*Rldr,mx=I||0.001;
  const diag=(
    <svg viewBox="0 0 360 250" style={{width:"100%"}}>
      <WP points={[[60,70],[180,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={200} y={110} label={`Rfixed=${Rfixed}Ω`} rotate={90}/>
      <WP points={[[200,150],[200,175]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Junction x={200} y={175}/>
      <line x1={200} y1={175} x2={290} y2={175} stroke="#22c55e" strokeWidth={2} strokeDasharray="5,3"/>
      <text x={295} y={171} fill="#22c55e" fontSize={11}>Vout</text>
      <text x={295} y={185} fill="#22c55e" fontSize={11}>{fmtV(Vout)}</text>
      <Resistor x={200} y={210} label={`LDR=${Rldr}Ω`} rotate={90} color="#f59e0b" variable/>
      <WP points={[[200,250],[60,250]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <WP points={[[60,250],[60,70]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={160} label={`${V}V`} rotate={90}/>
      <Lbl x={180} y={265} text="↓ LDR resistance falls with light ↑" color="#f59e0b" size={10}/>
    </svg>
  );
  const gd=Array.from({length:25},(_,i)=>{const r=100+i*100;return{x:r,y:V*r/(Rfixed+r)};});
  const meas=[{l:"Vout",v:fmtV(Vout),c:"#22c55e"},{l:"LDR R",v:fmtR(Rldr),c:"#f59e0b"},{l:"Current",v:fmtA(I),c:"#38bdf8"}];
  const eq=[{s:"Vout=V×Rldr/(Rfixed+Rldr)",n:`${V}×${Rldr}/${Rt}=${fmtV(Vout)}`}];
  const ch={t:"Simulate bright light: reduce LDR R to 100Ω. What happens to Vout?",h:"Lower Rldr → smaller voltage divider ratio → lower Vout.",fn:()=>Rldr<200};
  return{diag,meas,eq,gd,xLbl:"Rldr (Ω)",yLbl:"Vout (V)",ch};
}

function renderThermistor(p,simT,run,lp){
  const {V,Rfixed,temp}=p,Rntc=Rfixed*Math.exp(3500*(1/(temp+273)-1/298)),Rt=Rfixed+Rntc,I=safe(V/Rt),Vout=I*Rntc,mx=I||0.001;
  const diag=(
    <svg viewBox="0 0 360 250" style={{width:"100%"}}>
      <WP points={[[60,70],[180,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={200} y={110} label={`R=${Rfixed}Ω`} rotate={90}/>
      <WP points={[[200,150],[200,175]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Junction x={200} y={175}/>
      <text x={270} y={171} fill="#22c55e" fontSize={11}>Vout</text>
      <text x={270} y={185} fill="#22c55e" fontSize={11}>{fmtV(Vout)}</text>
      <Resistor x={200} y={215} label={`NTC=${Rntc.toFixed(0)}Ω`} rotate={90} color="#ef4444" variable/>
      <WP points={[[200,250],[60,250]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <WP points={[[60,250],[60,70]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={160} label={`${V}V`} rotate={90}/>
      <Lbl x={200} y={268} text={`T=${temp}°C → Rntc=${Rntc.toFixed(0)}Ω`} color="#ef4444" size={10}/>
    </svg>
  );
  const gd=Array.from({length:25},(_,i)=>{const t=0+i*4,r=Rfixed*Math.exp(3500*(1/(t+273)-1/298));return{x:t,y:V*r/(Rfixed+r)};});
  const meas=[{l:"Vout",v:fmtV(Vout),c:"#22c55e"},{l:"NTC R (@ T)",v:fmtR(Rntc),c:"#ef4444"},{l:"Temp",v:`${temp}°C`,c:"#f59e0b"}];
  const eq=[{s:"R_NTC=R₀×e^(B(1/T−1/T₀))",n:`${Rntc.toFixed(0)} Ω at ${temp}°C`}];
  const ch={t:"Increase temperature to 80°C. Watch Rntc and Vout change.",h:"NTC: resistance decreases exponentially with temperature.",fn:()=>temp>70};
  return{diag,meas,eq,gd,xLbl:"Temp (°C)",yLbl:"Vout (V)",ch};
}

function renderTransistorSwitch(p,simT,run,lp){
  const {Vcc,Ib_ua,Rcollector,hFE}=p,Ib=Ib_ua*1e-6,IcMax=safe(Vcc/Rcollector),Ic=Math.min(hFE*Ib,IcMax),Vce=Vcc-Ic*Rcollector,sat=Ic>=IcMax*0.95,mx=Ic||0.01;
  const diag=(
    <svg viewBox="0 0 360 250" style={{width:"100%"}}>
      <text x={190} y={28} fill="#f59e0b" fontSize={12} textAnchor="middle">+{Vcc}V (Vcc)</text>
      <line x1={190} y1={30} x2={190} y2={40} stroke="#f59e0b" strokeWidth={2}/>
      <WP points={[[190,40],[190,90]]} current={Ic} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={190} y={115} label={`Rc=${Rcollector}Ω`} rotate={90}/>
      <WP points={[[190,140],[190,165]]} current={Ic} maxI={mx} running={run} lowPerf={lp}/>
      <Transistor x={190} y={190}/>
      <WP points={[[190,215],[190,235],[80,235]]} current={Ic} maxI={mx} running={run} lowPerf={lp} reverse/>
      <WP points={[[60,190],[170,190]]} current={Ib} maxI={Ic} running={run} lowPerf={lp}/>
      <Resistor x={100} y={190} label={`Rb`}/>
      <Battery x={60} y={215} label="Vin" rotate={90}/>
      <Wire x1={60} y1={190} x2={60} y2={207} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={60} y1={223} x2={60} y2={235} stroke="#e2e8f0" sw={2.5}/>
      <Lbl x={200} y={248} text={sat?`SATURATED (ON) Vce=${Vce.toFixed(2)}V`:`ACTIVE Ic=${fmtA(Ic)}`} color={sat?"#22c55e":"#f59e0b"} size={10}/>
    </svg>
  );
  const gd=Array.from({length:25},(_,i)=>({x:i*5,y:Math.min(hFE*i*5e-6,IcMax)*1000}));
  const meas=[{l:"Ib",v:`${Ib_ua} μA`,c:"#a1a1aa"},{l:"Ic",v:fmtA(Ic),c:"#38bdf8"},{l:"Vce",v:fmtV(Vce),c:"#f59e0b"},{l:"State",v:sat?"ON (sat)":"Active",c:sat?"#22c55e":"#f59e0b"},{l:"β (hFE)",v:String(hFE),c:"#a1a1aa"}];
  const eq=[{s:"Ic=hFE×Ib",n:`${hFE}×${Ib_ua}μA=${fmtA(Ic)}`},{s:"Vce=Vcc−Ic×Rc",n:`${Vcc}−${fmtA(Ic)}×${Rcollector}=${fmtV(Vce)}`}];
  const ch={t:"Increase Ib to fully saturate (Vce < 0.2V).",h:`Need Ic≥Vcc/Rc=${IcMax*1000}mA → Ib≥${(IcMax/hFE*1e6).toFixed(0)}μA`,fn:()=>sat};
  return{diag,meas,eq,gd,xLbl:"Ib (μA)",yLbl:"Ic (mA)",ch};
}

function renderAndGate(p,upd,simT,run,lp){
  const {V,R1,sw1,sw2}=p,out=sw1&&sw2,I=out?safe(V/R1):0,mx=safe(V/R1)||0.5;
  const diag=(
    <svg viewBox="0 0 400 220" style={{width:"100%"}}>
      <WP points={[[60,80],[150,80]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <SwitchSym x={175} y={80} closed={sw1} label="SW1" onClick={()=>upd("sw1",!sw1)}/>
      <WP points={[[195,80],[260,80]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <SwitchSym x={285} y={80} closed={sw2} label="SW2" onClick={()=>upd("sw2",!sw2)}/>
      <WP points={[[305,80],[360,80]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Bulb x={360} y={80} brightness={out?1:0} label="OUT"/>
      <WP points={[[385,80],[410,80],[410,170],[60,170]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={125} label={`${V}V`} rotate={90}/>
      <WP points={[[60,80],[60,97]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,153],[60,170]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={210} y={208} text={`AND: SW1=${sw1?"1":"0"} SW2=${sw2?"1":"0"} OUT=${out?"1":"0"}`} color={out?"#22c55e":"#ef4444"}/>
    </svg>
  );
  const gd=[{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:I}];
  const meas=[{l:"SW1",v:sw1?"ON":"OFF",c:sw1?"#22c55e":"#ef4444"},{l:"SW2",v:sw2?"ON":"OFF",c:sw2?"#22c55e":"#ef4444"},{l:"Output",v:out?"HIGH":"LOW",c:out?"#22c55e":"#ef4444"}];
  const eq=[{s:"AND: Out = SW1 AND SW2",n:`${sw1?"1":"0"} AND ${sw2?"1":"0"} = ${out?"1":"0"}`}];
  const ch={t:"Close BOTH switches to get HIGH output.",h:"AND requires all inputs true simultaneously.",fn:()=>out};
  return{diag,meas,eq,gd,xLbl:"state",yLbl:"I (A)",ch};
}

function renderOrGate(p,upd,simT,run,lp){
  const {V,R1,sw1,sw2}=p,out=sw1||sw2,I=out?safe(V/R1):0,mx=safe(V/R1)||0.5;
  const diag=(
    <svg viewBox="0 0 420 240" style={{width:"100%"}}>
      <WP points={[[60,80],[140,80],[140,110]]} current={sw1?I:0} maxI={mx} running={run} lowPerf={lp}/>
      <SwitchSym x={165} y={110} closed={sw1} label="SW1" onClick={()=>upd("sw1",!sw1)}/>
      <WP points={[[185,110],[220,110],[220,140],[260,140]]} current={sw1?I:0} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,180],[140,180],[140,170]]} current={sw2?I:0} maxI={mx} running={run} lowPerf={lp}/>
      <SwitchSym x={165} y={170} closed={sw2} label="SW2" onClick={()=>upd("sw2",!sw2)}/>
      <WP points={[[185,170],[220,170],[220,140]]} current={sw2?I:0} maxI={mx} running={run} lowPerf={lp}/>
      <Junction x={220} y={140}/>
      <WP points={[[260,140],[320,140]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Bulb x={320} y={140} brightness={out?1:0} label="OUT"/>
      <WP points={[[350,140],[380,140],[380,220],[60,220]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={150} label={`${V}V`} rotate={90}/>
      <Wire x1={60} y1={80} x2={60} y2={122} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={60} y1={178} x2={60} y2={220} stroke="#e2e8f0" sw={2.5}/>
      <Lbl x={210} y={235} text={`OR: SW1=${sw1?"1":"0"} SW2=${sw2?"1":"0"} OUT=${out?"1":"0"}`} color={out?"#22c55e":"#ef4444"}/>
    </svg>
  );
  const gd=[{x:0,y:0},{x:1,y:0},{x:2,y:I},{x:3,y:I}];
  const meas=[{l:"SW1",v:sw1?"ON":"OFF",c:sw1?"#22c55e":"#ef4444"},{l:"SW2",v:sw2?"ON":"OFF",c:sw2?"#22c55e":"#ef4444"},{l:"Output",v:out?"HIGH":"LOW",c:out?"#22c55e":"#ef4444"}];
  const eq=[{s:"OR: Out = SW1 OR SW2",n:`${sw1?"1":"0"} OR ${sw2?"1":"0"} = ${out?"1":"0"}`}];
  const ch={t:"Close EITHER switch to get HIGH output.",h:"OR requires at least one input true.",fn:()=>out};
  return{diag,meas,eq,gd,xLbl:"state",yLbl:"I (A)",ch};
}

function renderFuseCircuit(p,upd,simT,run,lp){
  const {V,R1,Ifuse}=p,I=safe(V/R1),blown=I>Ifuse,Ieff=blown?0:I,mx=Ifuse*1.5||0.5;
  const diag=(
    <svg viewBox="0 0 400 210" style={{width:"100%"}}>
      <WP points={[[60,70],[150,70]]} current={Ieff} maxI={mx} running={run} lowPerf={lp}/>
      <Fuse x={180} y={70} blown={blown} label={`${Ifuse}A`}/>
      <WP points={[[210,70],[300,70]]} current={Ieff} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={325} y={115} label={`R=${R1}Ω`} rotate={90}/>
      <WP points={[[325,155],[325,175],[60,175]]} current={Ieff} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={122} label={`${V}V`} rotate={90}/>
      <WP points={[[60,70],[60,94]]} current={Ieff} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,150],[60,175]]} current={Ieff} maxI={mx} running={run} lowPerf={lp} reverse/>
      {blown&&<><rect x={60} y={47} width={280} height={20} rx={4} fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth={1}/><Lbl x={200} y={61} text="⚠ FUSE BLOWN — CIRCUIT OPEN" color="#ef4444" size={10}/></>}
      <Lbl x={200} y={200} text={blown?`I=${fmtA(I)} exceeded ${Ifuse}A — blown`:`I=${fmtA(I)} OK (limit: ${Ifuse}A)`} color={blown?"#ef4444":"#22c55e"}/>
    </svg>
  );
  const gd=Array.from({length:20},(_,i)=>({x:i*2+1,y:V/(i*2+1)}));
  const meas=[{l:"Current",v:fmtA(blown?0:I),c:blown?"#ef4444":"#38bdf8"},{l:"Fuse rating",v:fmtA(Ifuse),c:"#f59e0b"},{l:"Status",v:blown?"BLOWN":"OK",c:blown?"#ef4444":"#22c55e"}];
  const eq=[{s:"Fuse blows when I > rating",n:`${I.toFixed(2)}A vs ${Ifuse}A`}];
  const ch={t:`Reduce R below ${(V/Ifuse).toFixed(1)}Ω to blow the fuse.`,h:`I=V/R > ${Ifuse}A when R < ${(V/Ifuse).toFixed(1)}Ω`,fn:()=>blown};
  return{diag,meas,eq,gd,xLbl:"R (Ω)",yLbl:"I (A)",ch};
}

function renderTransformer(p,simT,run,lp){
  const {Vp,Np,Ns,Rload}=p,ratio=Ns/Np,Vs=Vp*ratio,Is=safe(Vs/Rload),Ip=Is*ratio,mx=Math.max(Ip,Is)*1.5||0.5;
  const diag=(
    <svg viewBox="0 0 440 220" style={{width:"100%"}}>
      <WP points={[[60,80],[150,80]]} current={Ip} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[60,160],[150,160]]} current={Ip} maxI={mx} running={run} lowPerf={lp} reverse/>
      <ACSource x={60} y={120} label={`${Vp}V AC`} rotate={90}/>
      <Wire x1={60} y1={80} x2={60} y2={93} stroke="#e2e8f0" sw={2.5}/>
      <Wire x1={60} y1={147} x2={60} y2={160} stroke="#e2e8f0" sw={2.5}/>
      <Transformer x={220} y={120}/>
      <WP points={[[280,98],[370,98]]} current={Is} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={370} y={120} label={`RL=${Rload}Ω`} rotate={90}/>
      <WP points={[[370,142],[280,142]]} current={Is} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={140} y={74} text={`Np=${Np}`} color="#a1a1aa" size={10}/>
      <Lbl x={295} y={90} text={`Ns=${Ns}`} color="#a1a1aa" size={10}/>
      <Lbl x={295} y={80} text={`Vs=${fmtV(Vs)}`} color="#22c55e" size={10}/>
      <Lbl x={80} y={74} text={`Vp=${fmtV(Vp)}`} color="#f59e0b" size={10}/>
      <Lbl x={220} y={208} text={`Vs=${fmtV(Vs)}  Is=${fmtA(Is)}  P=${fmtW(Vs*Is)}`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:20},(_,i)=>({x:i*100,y:Vp*(i*100)/Np}));
  const meas=[{l:"Vs",v:fmtV(Vs),c:"#22c55e"},{l:"Is",v:fmtA(Is),c:"#38bdf8"},{l:"Ip",v:fmtA(Ip),c:"#f59e0b"},{l:"Turns ratio",v:`${Np}:${Ns}`,c:"#a1a1aa"},{l:"Power",v:fmtW(Vs*Is),c:"#22c55e"}];
  const eq=[{s:"Vs/Vp=Ns/Np",n:`Vs=${Vp}×${Ns}/${Np}=${Vs.toFixed(2)} V`},{s:"IpVp=IsVs (ideal)",n:`${Ip.toFixed(3)}×${Vp}≈${Is.toFixed(3)}×${Vs.toFixed(1)}`}];
  const ch={t:`Set Ns so secondary voltage = 24 V.`,h:`Ns = Np×24/Vp = ${Math.round(Np*24/Vp)} turns`,fn:()=>Math.abs(Vs-24)<1};
  return{diag,meas,eq,gd,xLbl:"Ns",yLbl:"Vs (V)",ch};
}

function renderVoltageDivider(p,simT,run,lp){
  const {V,R1,R2}=p,I=safe(V/(R1+R2)),Vout=I*R2,mx=I||0.5;
  const diag=(
    <svg viewBox="0 0 340 260" style={{width:"100%"}}>
      <WP points={[[60,60],[180,60]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={180} y={100} label={`R₁=${R1}Ω`} rotate={90}/>
      <WP points={[[180,140],[180,165]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Junction x={180} y={165}/>
      <line x1={180} y1={165} x2={270} y2={165} stroke="#22c55e" strokeWidth={2} strokeDasharray="5,3"/>
      <text x={275} y={161} fill="#22c55e" fontSize={11}>Vout</text>
      <text x={275} y={175} fill="#22c55e" fontSize={11}>{fmtV(Vout)}</text>
      <Resistor x={180} y={205} label={`R₂=${R2}Ω`} rotate={90}/>
      <WP points={[[180,245],[60,245]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <WP points={[[60,245],[60,60]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={152} label={`${V}V`} rotate={90}/>
    </svg>
  );
  const gd=Array.from({length:25},(_,i)=>{const r2=1+i*5;return{x:r2,y:V*r2/(R1+r2)};});
  const meas=[{l:"Vout",v:fmtV(Vout),c:"#22c55e"},{l:"V across R₁",v:fmtV(I*R1),c:"#f59e0b"},{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"Ratio",v:`${(Vout/V*100).toFixed(0)}%`,c:"#a1a1aa"}];
  const eq=[{s:"Vout=V×R₂/(R₁+R₂)",n:`${V}×${R2}/${R1+R2}=${fmtV(Vout)}`}];
  const ch={t:`Make Vout = exactly half of V (${V/2}V).`,h:"Set R₁=R₂ for 50% output.",fn:()=>Math.abs(Vout-V/2)<0.05};
  return{diag,meas,eq,gd,xLbl:"R₂ (Ω)",yLbl:"Vout (V)",ch};
}

function renderInternalR(p,simT,run,lp){
  const {emf,r,R1}=p,I=safe(emf/Math.max(R1+r,1e-9)),Vt=emf-I*r,mx=Math.max(Math.abs(I),0.1);
  const diag=(
    <svg viewBox="0 0 440 230" style={{width:"100%"}}>
      <rect x={28} y={55} width={165} height={120} rx={8} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5,3"/>
      <text x={110} y={48} fill="#f59e0b" fontSize={10} textAnchor="middle">Battery with internal resistance</text>
      <Battery x={65} y={115} label={`ε=${emf}V`} rotate={90}/>
      <Resistor x={140} y={75} label={`r=${r}Ω`} color="#f59e0b"/>
      <Wire x1={65} y1={75} x2={115} y2={75}/>
      <Wire x1={165} y1={75} x2={195} y2={75}/>
      <WP points={[[195,75],[300,75]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={300} y={115} label={`R=${R1}Ω`} rotate={90}/>
      <WP points={[[300,155],[300,175],[65,175]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Wire x1={65} y1={175} x2={65} y2={143}/>
      <Lbl x={300} y={55} text={`Terminal V=${fmtV(Vt)}`} color="#22c55e"/>
      <Lbl x={220} y={212} text={`I=${fmtA(I)} • internal loss=${fmtW(I*I*r)}`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:40},(_,i)=>{const rl=Math.max(0.1,i*R1/12);const ii=emf/(rl+r);return{x:rl,y:emf-ii*r};});
  const meas=[{l:"Load current",v:fmtA(I),c:"#38bdf8"},{l:"Terminal voltage",v:fmtV(Vt),c:"#22c55e"},{l:"Lost volts",v:fmtV(I*r),c:"#f59e0b"},{l:"Internal loss",v:fmtW(I*I*r),c:"#ef4444"},{l:"Efficiency",v:`${(100*R1/(R1+r)).toFixed(1)}%`,c:"#a1a1aa"}];
  const eq=[{s:"I=ε/(R+r)",n:`${emf}/(${R1}+${r})=${fmtA(I)}`},{s:"Vterminal=ε−Ir",n:`${emf}−${I.toFixed(3)}×${r}=${fmtV(Vt)}`}];
  const ch={t:"Make terminal voltage at least 90% of the emf.",h:"Increase load resistance or reduce internal resistance.",fn:()=>Vt>=0.9*emf};
  return{diag,meas,eq,gd,xLbl:"Load R (Ω)",yLbl:"Terminal V (V)",ch};
}

function renderRheostat(p,simT,run,lp){
  const {V,R1,Rvar}=p,Rt=R1+Rvar,I=safe(V/Math.max(Rt,1e-9)),mx=Math.max(V/Math.max(R1,0.1),0.1);
  const diag=(
    <svg viewBox="0 0 430 220" style={{width:"100%"}}>
      <WP points={[[60,70],[150,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={175} y={70} label={`R=${R1}Ω`}/>
      <WP points={[[205,70],[270,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={300} y={70} label={`Rvar=${Rvar}Ω`} variable/>
      <WP points={[[330,70],[390,70],[390,165],[60,165]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={117} label={`${V}V`} rotate={90}/>
      <Wire x1={60} y1={70} x2={60} y2={89}/><Wire x1={60} y1={145} x2={60} y2={165}/>
      <Lbl x={220} y={205} text={`Rtotal=${fmtR(Rt)} • I=${fmtA(I)}`} color="#38bdf8"/>
    </svg>
  );
  const gd=Array.from({length:40},(_,i)=>({x:i*2.5,y:V/(R1+i*2.5)}));
  const meas=[{l:"Fixed R",v:fmtR(R1),c:"#a1a1aa"},{l:"Variable R",v:fmtR(Rvar),c:"#f59e0b"},{l:"Total R",v:fmtR(Rt),c:"#e2e8f0"},{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"Power",v:fmtW(V*I),c:"#22c55e"}];
  const eq=[{s:"Rtotal=R+Rvar",n:`${R1}+${Rvar}=${fmtR(Rt)}`},{s:"I=V/Rtotal",n:`${V}/${Rt}=${fmtA(I)}`}];
  const ch={t:"Adjust the rheostat until current is close to 0.50 A.",h:`Target total resistance is V/I = ${(V/0.5).toFixed(1)} Ω.`,fn:()=>Math.abs(I-0.5)<0.03};
  return{diag,meas,eq,gd,xLbl:"Rvar (Ω)",yLbl:"I (A)",ch};
}

function renderBatteriesSeries(p,simT,run,lp){
  const {V1,V2,V3,R1}=p,Vt=V1+V2+V3,I=safe(Vt/Math.max(R1,1e-9)),mx=Math.max(I,0.1);
  const diag=(
    <svg viewBox="0 0 480 230" style={{width:"100%"}}>
      <Battery x={90} y={75} label={`${V1}V`}/><Battery x={180} y={75} label={`${V2}V`}/><Battery x={270} y={75} label={`${V3}V`}/>
      <WP points={[[30,75],[65,75]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[115,75],[155,75]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[205,75],[245,75]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <WP points={[[295,75],[380,75]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={405} y={120} label={`R=${R1}Ω`} rotate={90}/>
      <WP points={[[405,155],[405,180],[30,180],[30,75]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={240} y={215} text={`Vtotal=${fmtV(Vt)} • I=${fmtA(I)}`} color="#38bdf8"/>
    </svg>
  );
  const gd=Array.from({length:31},(_,i)=>({x:i,y:i/Math.max(R1,0.01)}));
  const meas=[{l:"Total emf",v:fmtV(Vt),c:"#f59e0b"},{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"Load power",v:fmtW(I*I*R1),c:"#22c55e"}];
  const eq=[{s:"εtotal=ε1+ε2+ε3",n:`${V1}+${V2}+${V3}=${fmtV(Vt)}`},{s:"I=εtotal/R",n:`${Vt}/${R1}=${fmtA(I)}`}];
  const ch={t:"Set the three batteries to produce exactly 18 V total.",h:"Their emfs add in series.",fn:()=>Math.abs(Vt-18)<0.05};
  return{diag,meas,eq,gd,xLbl:"Total emf (V)",yLbl:"I (A)",ch};
}

function renderBatteriesParallel(p,simT,run,lp){
  const {V1,V2,R1}=p,Veq=(V1+V2)/2,mismatch=Math.abs(V1-V2),I=safe(Veq/Math.max(R1,1e-9)),branch=I/2,mx=Math.max(I,0.1);
  const diag=(
    <svg viewBox="0 0 440 250" style={{width:"100%"}}>
      <Junction x={90} y={65}/><Junction x={280} y={65}/><Junction x={90} y={180}/><Junction x={280} y={180}/>
      <WP points={[[90,65],[280,65]]} current={branch} maxI={mx} running={run} lowPerf={lp}/>
      <Battery x={145} y={120} label={`${V1}V`} rotate={90}/><Battery x={225} y={120} label={`${V2}V`} rotate={90}/>
      <Wire x1={90} y1={65} x2={145} y2={65}/><Wire x1={145} y1={65} x2={145} y2={92}/><Wire x1={145} y1={148} x2={145} y2={180}/><Wire x1={145} y1={180} x2={90} y2={180}/>
      <Wire x1={280} y1={65} x2={225} y2={65}/><Wire x1={225} y1={65} x2={225} y2={92}/><Wire x1={225} y1={148} x2={225} y2={180}/><Wire x1={225} y1={180} x2={280} y2={180}/>
      <WP points={[[280,65],[365,65]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <Resistor x={365} y={122} label={`R=${R1}Ω`} rotate={90}/>
      <WP points={[[365,160],[365,180],[280,180]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Lbl x={220} y={225} text={`V≈${fmtV(Veq)} • Itotal=${fmtA(I)}`} color={mismatch>0.05?"#ef4444":"#38bdf8"}/>
    </svg>
  );
  const gd=Array.from({length:30},(_,i)=>({x:i+1,y:Veq/(i+1)}));
  const meas=[{l:"Output voltage",v:fmtV(Veq),c:"#f59e0b"},{l:"Total current",v:fmtA(I),c:"#38bdf8"},{l:"Current per cell",v:fmtA(branch),c:"#22c55e"},{l:"Voltage mismatch",v:fmtV(mismatch),c:mismatch>0.05?"#ef4444":"#a1a1aa"}];
  const eq=[{s:"Ideal equal batteries in parallel",n:"Voltage stays the same; current capacity increases."},{s:"Iload=V/R",n:`${Veq.toFixed(2)}/${R1}=${fmtA(I)}`}];
  const ch={t:"Make both battery voltages equal.",h:"Parallel voltage sources should be closely matched.",fn:()=>mismatch<0.05};
  return{diag,meas,eq,gd,xLbl:"Load R (Ω)",yLbl:"I (A)",ch,warning:mismatch>0.2?"Do not directly parallel unequal real batteries; large equalization currents may flow.":null};
}

function renderOpposingBatteries(p,simT,run,lp){
  const {V1,V2,R1}=p,Vnet=V1-V2,I=safe(Vnet/Math.max(R1,1e-9)),mx=Math.max(Math.abs(I),0.1);
  const diag=(
    <svg viewBox="0 0 440 225" style={{width:"100%"}}>
      <Battery x={110} y={70} label={`${V1}V`}/><Battery x={230} y={70} label={`${V2}V`} rotate={180}/>
      <WP points={[[40,70],[85,70]]} current={Math.abs(I)} maxI={mx} running={run} lowPerf={lp} reverse={I<0}/>
      <WP points={[[135,70],[205,70]]} current={Math.abs(I)} maxI={mx} running={run} lowPerf={lp} reverse={I<0}/>
      <WP points={[[255,70],[350,70]]} current={Math.abs(I)} maxI={mx} running={run} lowPerf={lp} reverse={I<0}/>
      <Resistor x={375} y={120} label={`R=${R1}Ω`} rotate={90}/>
      <WP points={[[375,155],[375,175],[40,175],[40,70]]} current={Math.abs(I)} maxI={mx} running={run} lowPerf={lp} reverse={I>=0}/>
      <Lbl x={220} y={210} text={`Vnet=${fmtV(Vnet)} • I=${fmtA(I)}`} color={Vnet===0?"#a1a1aa":"#38bdf8"}/>
    </svg>
  );
  const gd=Array.from({length:41},(_,i)=>({x:i,y:(V1-i)/R1}));
  const meas=[{l:"Net emf",v:fmtV(Vnet),c:"#f59e0b"},{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"Direction",v:I>0?"V1 → V2":I<0?"V2 → V1":"No current",c:"#22c55e"}];
  const eq=[{s:"εnet=ε1−ε2",n:`${V1}−${V2}=${fmtV(Vnet)}`},{s:"I=εnet/R",n:`${Vnet}/${R1}=${fmtA(I)}`}];
  const ch={t:"Balance the circuit so current becomes zero.",h:"Set V1 equal to V2.",fn:()=>Math.abs(I)<0.01};
  return{diag,meas,eq,gd,xLbl:"Opposing V2 (V)",yLbl:"I (A)",ch};
}

function renderMotorCircuit(p,simT,run,lp){
  const {V,R1,Vback}=p,Vnet=V-Vback,I=safe(Vnet/Math.max(R1,1e-9)),Pin=V*Math.abs(I),Pcu=I*I*R1,Pmech=Math.max(0,Pin-Pcu),mx=Math.max(Math.abs(V/R1),0.1);
  const spin=run?((simT*240)%360):0;
  const diag=(
    <svg viewBox="0 0 430 240" style={{width:"100%"}}>
      <WP points={[[60,65],[270,65]]} current={Math.abs(I)} maxI={mx} running={run} lowPerf={lp} reverse={I<0}/>
      <circle cx={315} cy={110} r={40} fill="rgba(56,189,248,.08)" stroke="#e2e8f0" strokeWidth={2}/>
      <g transform={`translate(315,110) rotate(${spin})`}><line x1={-26} y1={0} x2={26} y2={0} stroke="#38bdf8" strokeWidth={5}/><line x1={0} y1={-26} x2={0} y2={26} stroke="#38bdf8" strokeWidth={5}/></g>
      <text x={315} y={115} fill="#f4f4f5" fontSize={12} textAnchor="middle">M</text>
      <Resistor x={220} y={170} label={`coil ${R1}Ω`}/>
      <WP points={[[315,150],[315,170],[245,170]]} current={Math.abs(I)} maxI={mx} running={run} lowPerf={lp} reverse={I>=0}/>
      <WP points={[[195,170],[60,170]]} current={Math.abs(I)} maxI={mx} running={run} lowPerf={lp} reverse={I>=0}/>
      <Battery x={60} y={117} label={`${V}V`} rotate={90}/><Wire x1={60} y1={65} x2={60} y2={89}/><Wire x1={60} y1={145} x2={60} y2={170}/>
      <Lbl x={215} y={220} text={`Back emf=${fmtV(Vback)} • I=${fmtA(I)} • Pmech≈${fmtW(Pmech)}`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:40},(_,i)=>({x:i*V/39,y:(V-i*V/39)/Math.max(R1,0.01)}));
  const meas=[{l:"Supply",v:fmtV(V),c:"#f59e0b"},{l:"Back emf",v:fmtV(Vback),c:"#22c55e"},{l:"Armature current",v:fmtA(I),c:"#38bdf8"},{l:"Copper loss",v:fmtW(Pcu),c:"#ef4444"},{l:"Mechanical power",v:fmtW(Pmech),c:"#22c55e"}];
  const eq=[{s:"I=(V−Eback)/R",n:`(${V}−${Vback})/${R1}=${fmtA(I)}`},{s:"Pmechanical≈Eback I",n:`${Vback}×${Math.abs(I).toFixed(3)}=${fmtW(Vback*Math.abs(I))}`}];
  const ch={t:"Set back emf to 75% of the supply voltage.",h:`Target is ${(0.75*V).toFixed(2)} V.`,fn:()=>Math.abs(Vback-0.75*V)<0.1};
  return{diag,meas,eq,gd,xLbl:"Back emf (V)",yLbl:"Current (A)",ch,warning:Vback>V?"Back emf exceeds supply: the machine is operating as a generator in this simplified model.":null};
}

function renderGenerator(p,simT,run,lp){
  const {Vgen,Rload,Rint}=p,I=safe(Vgen/Math.max(Rload+Rint,1e-9)),Vt=I*Rload,Pl=I*I*Rload,loss=I*I*Rint,mx=Math.max(I,0.1);
  const diag=(
    <svg viewBox="0 0 440 230" style={{width:"100%"}}>
      <circle cx={90} cy={115} r={35} fill="rgba(245,158,11,.08)" stroke="#e2e8f0" strokeWidth={2}/><text x={90} y={121} fill="#f59e0b" fontSize={18} textAnchor="middle">G</text>
      <WP points={[[125,95],[190,95]]} current={I} maxI={mx} running={run} lowPerf={lp}/><Resistor x={220} y={95} label={`r=${Rint}Ω`} color="#f59e0b"/>
      <WP points={[[250,95],[350,95]]} current={I} maxI={mx} running={run} lowPerf={lp}/><Resistor x={350} y={140} label={`RL=${Rload}Ω`} rotate={90}/>
      <WP points={[[350,175],[350,190],[90,190],[90,150]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Wire x1={90} y1={80} x2={90} y2={65}/><Wire x1={90} y1={65} x2={125} y2={65}/><Wire x1={125} y1={65} x2={125} y2={95}/>
      <Lbl x={220} y={220} text={`Vterminal=${fmtV(Vt)} • Load power=${fmtW(Pl)}`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:40},(_,i)=>{const rl=Math.max(.1,i*Rload/12);const ii=Vgen/(rl+Rint);return{x:rl,y:ii*rl};});
  const meas=[{l:"Generated emf",v:fmtV(Vgen),c:"#f59e0b"},{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"Terminal voltage",v:fmtV(Vt),c:"#22c55e"},{l:"Load power",v:fmtW(Pl),c:"#22c55e"},{l:"Internal loss",v:fmtW(loss),c:"#ef4444"}];
  const eq=[{s:"I=E/(RL+r)",n:`${Vgen}/(${Rload}+${Rint})=${fmtA(I)}`},{s:"Vterminal=IRL",n:`${I.toFixed(3)}×${Rload}=${fmtV(Vt)}`}];
  const ch={t:"Choose load resistance near internal resistance for maximum power transfer.",h:`Set Rload ≈ Rint = ${Rint} Ω.`,fn:()=>Math.abs(Rload-Rint)<Math.max(.1,Rint*.05)};
  return{diag,meas,eq,gd,xLbl:"Load R (Ω)",yLbl:"Terminal V (V)",ch};
}

function renderCharging(p,simT,run,lp){
  const {Vcharger,Vbatt,Rseries}=p,Vnet=Vcharger-Vbatt,I=safe(Vnet/Math.max(Rseries,1e-9)),charging=I>0,mx=Math.max(Math.abs(I),0.1);
  const diag=(
    <svg viewBox="0 0 460 225" style={{width:"100%"}}>
      <Battery x={95} y={80} label={`charger ${Vcharger}V`}/><Battery x={310} y={80} label={`battery ${Vbatt}V`} rotate={180}/>
      <WP points={[[35,80],[70,80]]} current={Math.abs(I)} maxI={mx} running={run} lowPerf={lp} reverse={I<0}/><WP points={[[120,80],[200,80]]} current={Math.abs(I)} maxI={mx} running={run} lowPerf={lp} reverse={I<0}/>
      <Resistor x={225} y={80} label={`R=${Rseries}Ω`}/><WP points={[[250,80],[285,80]]} current={Math.abs(I)} maxI={mx} running={run} lowPerf={lp} reverse={I<0}/>
      <WP points={[[335,80],[405,80],[405,175],[35,175],[35,80]]} current={Math.abs(I)} maxI={mx} running={run} lowPerf={lp} reverse={I>=0}/>
      <Lbl x={230} y={210} text={`${charging?"CHARGING":"DISCHARGING"} • I=${fmtA(I)}`} color={charging?"#22c55e":"#ef4444"}/>
    </svg>
  );
  const gd=Array.from({length:41},(_,i)=>({x:i*Vcharger/40,y:(Vcharger-i*Vcharger/40)/Math.max(Rseries,.01)}));
  const meas=[{l:"Voltage difference",v:fmtV(Vnet),c:"#f59e0b"},{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"Mode",v:charging?"Charging":"Battery drives charger",c:charging?"#22c55e":"#ef4444"},{l:"Resistor loss",v:fmtW(I*I*Rseries),c:"#a1a1aa"}];
  const eq=[{s:"I=(Vcharger−Vbattery)/R",n:`(${Vcharger}−${Vbatt})/${Rseries}=${fmtA(I)}`}];
  const ch={t:"Set a positive charging current below 2 A.",h:"Charger voltage must exceed battery voltage, but series resistance limits current.",fn:()=>I>0&&I<2};
  return{diag,meas,eq,gd,xLbl:"Battery voltage (V)",yLbl:"Charge current (A)",ch,warning:Math.abs(I)>5?"Simplified model predicts very high current. Real charging requires a regulated charger and battery-specific safety controls.":null};
}

function renderJouleHeat(p,simT,run,lp){
  const {V,R1,t}=p,I=safe(V/Math.max(R1,1e-9)),P=V*I,H=P*t,mx=Math.max(I,0.1),heat=Math.min(1,P/1000);
  const diag=(
    <svg viewBox="0 0 420 230" style={{width:"100%"}}>
      <WP points={[[60,70],[170,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <g transform="translate(250,70)"><rect x={-55} y={-18} width={110} height={36} rx={10} fill={`rgba(239,68,68,${.08+.45*heat})`} stroke="#e2e8f0" strokeWidth={2}/><path d="M -42,0 C -30,-18 -18,18 -6,0 S 18,18 30,0 S 42,-18 48,0" fill="none" stroke="#f59e0b" strokeWidth={3}/><text x={0} y={38} fill="#a1a1aa" fontSize={10} textAnchor="middle">Heater {R1}Ω</text></g>
      <WP points={[[305,70],[370,70],[370,170],[60,170]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={60} y={120} label={`${V}V`} rotate={90}/><Wire x1={60} y1={70} x2={60} y2={92}/><Wire x1={60} y1={148} x2={60} y2={170}/>
      <Lbl x={210} y={215} text={`P=${fmtW(P)} • Heat in ${t}s = ${fmtJ(H)}`} color="#f59e0b"/>
    </svg>
  );
  const gd=Array.from({length:40},(_,i)=>({x:i*t/39,y:P*i*t/39}));
  const meas=[{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"Power",v:fmtW(P),c:"#f59e0b"},{l:"Time",v:`${t.toFixed(0)} s`,c:"#a1a1aa"},{l:"Heat energy",v:fmtJ(H),c:"#ef4444"}];
  const eq=[{s:"P=V²/R",n:`${V}²/${R1}=${fmtW(P)}`},{s:"H=Pt=I²Rt",n:`${P.toFixed(2)}×${t}=${fmtJ(H)}`}];
  const ch={t:"Produce exactly 1.0 kJ of heat (within 5%).",h:"Adjust voltage, resistance, or time so P×t≈1000 J.",fn:()=>Math.abs(H-1000)<50};
  return{diag,meas,eq,gd,xLbl:"Time (s)",yLbl:"Energy (J)",ch};
}

function renderPowerMeter(p,simT,run,lp){
  const {V,R1,t}=p,I=safe(V/Math.max(R1,1e-9)),P=V*I,E=P*t,kWh=E/3.6e6,cost=kWh*8,mx=Math.max(I,0.1);
  const diag=(
    <svg viewBox="0 0 430 235" style={{width:"100%"}}>
      <WP points={[[55,70],[155,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/>
      <g transform="translate(220,70)"><rect x={-48} y={-28} width={96} height={56} rx={8} fill="rgba(56,189,248,.08)" stroke="#38bdf8" strokeWidth={2}/><text x={0} y={-5} fill="#a1a1aa" fontSize={9} textAnchor="middle">ENERGY METER</text><text x={0} y={13} fill="#f4f4f5" fontSize={14} textAnchor="middle">{kWh.toFixed(4)} kWh</text></g>
      <WP points={[[270,70],[345,70]]} current={I} maxI={mx} running={run} lowPerf={lp}/><Resistor x={365} y={120} label={`Load ${R1}Ω`} rotate={90}/>
      <WP points={[[365,155],[365,175],[55,175]]} current={I} maxI={mx} running={run} lowPerf={lp} reverse/>
      <Battery x={55} y={122} label={`${V}V`} rotate={90}/><Wire x1={55} y1={70} x2={55} y2={94}/><Wire x1={55} y1={150} x2={55} y2={175}/>
      <Lbl x={215} y={218} text={`P=${fmtW(P)} • E=${fmtJ(E)} • estimated ₹${cost.toFixed(2)} at ₹8/kWh`} color="#38bdf8" size={10}/>
    </svg>
  );
  const gd=Array.from({length:40},(_,i)=>({x:i*t/39/3600,y:P*i*t/39/1000}));
  const meas=[{l:"Current",v:fmtA(I),c:"#38bdf8"},{l:"Power",v:fmtW(P),c:"#f59e0b"},{l:"Energy",v:`${kWh.toFixed(5)} kWh`,c:"#22c55e"},{l:"Energy (J)",v:fmtJ(E),c:"#a1a1aa"},{l:"Example cost",v:`₹${cost.toFixed(2)}`,c:"#22c55e"}];
  const eq=[{s:"P=V²/R",n:`${V}²/${R1}=${fmtW(P)}`},{s:"E(kWh)=P(kW)×t(h)",n:`${(P/1000).toFixed(3)}×${(t/3600).toFixed(3)}=${kWh.toFixed(5)} kWh`}];
  const ch={t:"Make the meter read approximately 1.00 kWh.",h:"Increase time or power until P(kW)×t(h)=1.",fn:()=>Math.abs(kWh-1)<0.05};
  return{diag,meas,eq,gd,xLbl:"Time (h)",yLbl:"Energy (kJ)",ch};
}

const RENDERERS={
  basic_series:renderBasicSeries,open_circuit:renderOpenCircuit,short_circuit:renderShortCircuit,single_bulb:renderSingleBulb,
  switch_bulb:renderSwitchBulb,series_bulbs:renderSeriesBulbs,parallel_bulbs:renderParallelBulbs,series3:renderSeries3,
  parallel3:renderParallel3,mixed_sp:renderMixedSP,rheostat:renderRheostat,voltage_divider:renderVoltageDivider,
  batteries_series:renderBatteriesSeries,batteries_parallel:renderBatteriesParallel,opposing_batteries:renderOpposingBatteries,internal_r:renderInternalR,
  cap_charge:renderCapCharge,cap_discharge:renderCapDischarge,caps_series:renderCapsSeries,caps_parallel:renderCapsParallel,
  rl_growth:renderRLGrowth,inductor_energy:renderInductorEnergy,wheatstone:renderWheatstone,
  ac_resistor:renderACResistor,ac_cap:renderACCap,ac_ind:renderACInd,series_rlc:renderSeriesRLC,
  diode_fwd:renderDiodeFwd,diode_rev:renderDiodeRev,led_circuit:renderLEDCircuit,half_wave:renderHalfWave,full_wave:renderFullWave,
  zener_reg:renderZenerReg,ldr_circuit:renderLDRCircuit,thermistor:renderThermistor,transistor_switch:renderTransistorSwitch,
  and_gate:renderAndGate,or_gate:renderOrGate,fuse_circuit:renderFuseCircuit,transformer:renderTransformer,
  motor_circuit:renderMotorCircuit,generator:renderGenerator,charging:renderCharging,joule_heat:renderJouleHeat,power_meter:renderPowerMeter
};

function getParamMeta(key,value){
  const v=Math.abs(Number(value)||1);
  if(typeof value==="boolean")return{kind:"bool"};
  if(["sw","sw1","sw2"].includes(key))return{kind:"bool"};
  if(key==="temp")return{min:-20,max:120,step:1,unit:"°C"};
  if(key==="hFE")return{min:10,max:500,step:5,unit:""};
  if(key==="Ib_ua")return{min:0,max:500,step:5,unit:"μA"};
  if(key==="f")return{min:1,max:2000,step:1,unit:"Hz"};
  if(key==="C"||/^C\d/.test(key))return{min:1,max:Math.max(2000,v*3),step:1,unit:"μF"};
  if(key==="L"||/^L\d/.test(key))return{min:1,max:Math.max(1500,v*3),step:1,unit:"mH"};
  if(/^N[ps]$/.test(key))return{min:1,max:Math.max(5000,v*2),step:Math.max(1,Math.round(v/100)),unit:"turns"};
  if(key==="t")return{min:1,max:Math.max(7200,v*2),step:1,unit:"s"};
  if(key==="Ifuse")return{min:.1,max:30,step:.1,unit:"A"};
  if(key==="Vf"||key==="Vz")return{min:.1,max:30,step:.1,unit:"V"};
  if(/^V|emf/.test(key))return{min:0,max:Math.max(30,v*2.2),step:v>100?10:.1,unit:"V"};
  if(/^R|^r$/.test(key))return{min:key==="r"?.01:.1,max:Math.max(100,v*3),step:v>1000?100:v>100?10:v>10?1:.1,unit:"Ω"};
  return{min:0,max:Math.max(100,v*3),step:.1,unit:""};
}

function ParameterControl({name,value,onChange,disabled}){
  const meta=getParamMeta(name,value);
  const nice={R1:"Resistance R₁",R2:"Resistance R₂",R3:"Resistance R₃",R4:"Resistance R₄",Rvar:"Variable resistance",Rload:"Load resistance",Rint:"Internal resistance",Rseries:"Series resistance",Rfixed:"Fixed resistance",Rldr:"LDR resistance",Rser:"Series resistance",Rcollector:"Collector resistance",Rbase:"Base resistance",V:"Supply voltage",V1:"Voltage V₁",V2:"Voltage V₂",V3:"Voltage V₃",Vpeak:"Peak voltage",V0:"Initial voltage",Vcc:"Collector supply",Vp:"Primary voltage",Vgen:"Generator emf",Vcharger:"Charger voltage",Vbatt:"Battery voltage",Vback:"Back emf",emf:"Cell emf",r:"Internal resistance",C:"Capacitance",C1:"Capacitance C₁",C2:"Capacitance C₂",C3:"Capacitance C₃",L:"Inductance",f:"Frequency",Np:"Primary turns",Ns:"Secondary turns",Ib_ua:"Base current",hFE:"Current gain β",Ifuse:"Fuse rating",temp:"Temperature",t:"Time",sw:"Switch",sw1:"Switch 1",sw2:"Switch 2",Vf:"Forward voltage",Vz:"Zener voltage"}[name]||name;
  if(meta.kind==="bool")return <label className="toggleRow"><span>{nice}</span><button className={`switchButton ${value?"on":""}`} onClick={()=>onChange(!value)} disabled={disabled} aria-pressed={value}><span/></button></label>;
  return <div className="control"><div className="controlTop"><label htmlFor={`p-${name}`}>{nice}</label><div className="numberWrap"><input id={`n-${name}`} type="number" value={value} min={meta.min} max={meta.max} step={meta.step} disabled={disabled} onChange={e=>onChange(Number(e.target.value))}/><span>{meta.unit}</span></div></div><input id={`p-${name}`} type="range" value={Math.min(meta.max,Math.max(meta.min,Number(value)))} min={meta.min} max={meta.max} step={meta.step} disabled={disabled} onChange={e=>onChange(Number(e.target.value))}/><div className="rangeEnds"><span>{meta.min}</span><span>{meta.max}</span></div></div>;
}

function InfoCard({title,children,className=""}){return <section className={`infoCard ${className}`}><h3>{title}</h3>{children}</section>}

function App(){
  const [selectedId,setSelectedId]=useState(1);
  const [activeCat,setActiveCat]=useState("all");
  const [query,setQuery]=useState("");
  const [theme,setTheme]=useState(()=>{try{return localStorage.getItem("circuit-theme")||"dark"}catch{return"dark"}});
  const [params,setParams]=useState({...CIRCUITS[0].params});
  const [running,setRunning]=useState(true);
  const [lowPerf,setLowPerf]=useState(false);
  const [simT,setSimT]=useState(0);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [tab,setTab]=useState("experiment");
  const [hint,setHint]=useState(false);
  const [result,setResult]=useState(null);
  const [favorites,setFavorites]=useState(()=>{try{return new Set(JSON.parse(localStorage.getItem("circuit-favorites")||"[]"))}catch{return new Set()}});
  const [completed,setCompleted]=useState(()=>{try{return new Set(JSON.parse(localStorage.getItem("circuit-completed")||"[]"))}catch{return new Set()}});
  const current=CIRCUITS.find(c=>c.id===selectedId)||CIRCUITS[0];
  const colors=THEME[theme];

  useEffect(()=>{setParams({...current.params});setSimT(0);setHint(false);setResult(null);setRunning(true);},[selectedId]);
  useEffect(()=>{try{localStorage.setItem("circuit-theme",theme)}catch{}},[theme]);
  useEffect(()=>{try{localStorage.setItem("circuit-favorites",JSON.stringify([...favorites]));localStorage.setItem("circuit-completed",JSON.stringify([...completed]))}catch{}},[favorites,completed]);
  useEffect(()=>{
    if(!running)return;
    let raf,last=performance.now(),id;
    const loop=now=>{const dt=Math.min((now-last)/1000,.05);last=now;setSimT(t=>t+dt);id=requestAnimationFrame(loop)};
    id=requestAnimationFrame(loop);return()=>cancelAnimationFrame(id);
  },[running]);

  const updateParam=useCallback((key,val)=>{setParams(old=>({...old,[key]:val}));setResult(null)},[]);
  let model;
  try{const renderer=RENDERERS[current.template]||renderBasicSeries;model=renderer.length>=5?renderer(params,updateParam,simT,running,lowPerf):renderer(params,simT,running,lowPerf)}catch(err){model={diag:<div className="errorBox">Renderer error: {String(err.message||err)}</div>,meas:[],eq:[],gd:[],xLbl:"x",yLbl:"y",ch:null,warning:"A calculation could not be rendered with the present parameter values."};}

  const filtered=useMemo(()=>CIRCUITS.filter(c=>(activeCat==="all"||c.cat===activeCat)&&(c.name.toLowerCase().includes(query.toLowerCase())||c.desc.toLowerCase().includes(query.toLowerCase()))),[activeCat,query]);
  const checkChallenge=()=>{if(!model.ch)return;const ok=Boolean(model.ch.fn());setResult(ok);if(ok)setCompleted(old=>new Set([...old,current.id]));};
  const toggleFavorite=()=>setFavorites(old=>{const n=new Set(old);n.has(current.id)?n.delete(current.id):n.add(current.id);return n});
  const reset=()=>{setParams({...current.params});setSimT(0);setResult(null);setHint(false)};
  const progress=Math.round(completed.size/CIRCUITS.length*100);
  const danger=/Short Circuit|Ammeter \(Wrong\)|Mains|Household|Earth Wire|Three-Pin|Power Transmission|Battery Charging/.test(current.name)||Number(params.V)>50||Number(params.Vp)>50;
  const catObj=CATEGORIES.find(c=>c.id===current.cat);

  return <div className={`app ${theme}`} style={{"--bg":colors.bg,"--panel":colors.panel,"--panel2":colors.panel2,"--border":colors.border,"--text":colors.text,"--muted":colors.textSec,"--accent":colors.accent,"--success":colors.success,"--warning":colors.warning,"--error":colors.error,"--grid":colors.gridLine}}>
    <style>{`
      *{box-sizing:border-box}html,body,#root{margin:0;min-height:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--text)}button,input{font:inherit}button{color:inherit}.app{min-height:100vh;background:radial-gradient(circle at 70% -20%,rgba(59,130,246,.16),transparent 34%),var(--bg);color:var(--text);transition:.25s}.shell{display:grid;grid-template-columns:310px minmax(0,1fr);min-height:100vh}.sidebar{position:sticky;top:0;height:100vh;overflow:auto;border-right:1px solid var(--border);background:color-mix(in srgb,var(--panel) 94%,transparent);padding:18px;z-index:20}.brand{display:flex;align-items:center;gap:11px;margin-bottom:16px}.brandIcon{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,#2563eb,#38bdf8);font-size:22px;box-shadow:0 8px 28px rgba(37,99,235,.35)}.brand h1{font-size:17px;margin:0}.brand p{font-size:11px;color:var(--muted);margin:2px 0 0}.search{width:100%;background:var(--panel2);border:1px solid var(--border);color:var(--text);border-radius:11px;padding:10px 12px;outline:none}.search:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(59,130,246,.16)}.progressBox{margin:13px 0;background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:10px}.progressLine{height:7px;background:rgba(127,127,127,.18);border-radius:9px;overflow:hidden;margin-top:7px}.progressLine span{display:block;height:100%;background:linear-gradient(90deg,#2563eb,#22c55e)}.catList{display:flex;gap:7px;overflow-x:auto;padding:2px 0 11px}.catChip{white-space:nowrap;border:1px solid var(--border);background:var(--panel2);padding:7px 9px;border-radius:10px;font-size:12px;cursor:pointer}.catChip.active{background:var(--accent);border-color:var(--accent);color:white}.lessonList{display:grid;gap:7px;padding-bottom:30px}.lesson{display:flex;gap:9px;align-items:flex-start;text-align:left;border:1px solid transparent;border-radius:11px;background:transparent;padding:9px;cursor:pointer;width:100%}.lesson:hover{background:var(--panel2)}.lesson.active{background:rgba(59,130,246,.13);border-color:rgba(59,130,246,.45)}.lessonNum{width:27px;height:27px;flex:0 0 27px;border-radius:8px;display:grid;place-items:center;background:var(--panel2);font-size:11px;color:var(--muted)}.lesson.active .lessonNum{background:var(--accent);color:#fff}.lessonText b{display:block;font-size:12px;line-height:1.35}.lessonText small{display:block;color:var(--muted);font-size:10px;line-height:1.35;margin-top:2px}.checkMark{margin-left:auto;color:var(--success)}.main{min-width:0}.topbar{height:68px;position:sticky;top:0;z-index:15;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 22px;border-bottom:1px solid var(--border);background:color-mix(in srgb,var(--bg) 87%,transparent);backdrop-filter:blur(16px)}.titleBlock h2{font-size:18px;margin:0}.titleBlock p{font-size:11px;color:var(--muted);margin:2px 0 0}.actions{display:flex;gap:8px}.iconBtn,.primaryBtn,.softBtn{border:1px solid var(--border);background:var(--panel);border-radius:10px;padding:8px 11px;cursor:pointer}.iconBtn:hover,.softBtn:hover{border-color:var(--accent)}.primaryBtn{background:var(--accent);border-color:var(--accent);color:white;font-weight:700}.content{padding:20px;max-width:1480px;margin:auto}.hero{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin-bottom:15px}.eyebrow{font-size:11px;color:#38bdf8;text-transform:uppercase;letter-spacing:.12em;font-weight:800}.hero h2{font-size:27px;margin:4px 0 7px}.hero p{color:var(--muted);margin:0;max-width:760px;line-height:1.55}.star{font-size:25px;border:0;background:transparent;cursor:pointer;color:var(--muted)}.star.on{color:#f59e0b}.warning{border:1px solid rgba(245,158,11,.45);background:rgba(245,158,11,.09);padding:11px 13px;border-radius:11px;margin-bottom:15px;color:color-mix(in srgb,var(--warning) 85%,var(--text));font-size:12px;line-height:1.45}.workspace{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(300px,.7fr);gap:15px}.panel{background:var(--panel);border:1px solid var(--border);border-radius:16px;box-shadow:0 12px 45px rgba(0,0,0,.12)}.diagramPanel{min-height:470px;overflow:hidden}.panelHead{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:13px 15px;border-bottom:1px solid var(--border)}.panelHead h3{margin:0;font-size:13px}.simBtns{display:flex;gap:7px}.simCanvas{padding:14px;min-height:330px;display:grid;place-items:center;background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:24px 24px}.simCanvas svg{max-height:360px}.tabs{display:flex;border-top:1px solid var(--border);overflow-x:auto}.tab{flex:1;min-width:90px;border:0;background:transparent;color:var(--muted);padding:11px;cursor:pointer;border-bottom:2px solid transparent}.tab.active{color:var(--text);border-bottom-color:var(--accent);background:rgba(59,130,246,.06)}.tabContent{padding:16px}.controlsPanel{padding-bottom:14px}.controlsScroll{padding:13px;display:grid;gap:13px;max-height:670px;overflow:auto}.control{background:var(--panel2);border:1px solid var(--border);border-radius:11px;padding:10px}.controlTop{display:flex;align-items:center;justify-content:space-between;gap:8px}.control label,.toggleRow>span{font-size:11px;font-weight:700}.numberWrap{display:flex;align-items:center;gap:5px}.numberWrap input{width:88px;background:var(--panel);border:1px solid var(--border);color:var(--text);border-radius:7px;padding:5px 6px;text-align:right}.numberWrap span{font-size:10px;color:var(--muted)}input[type=range]{width:100%;accent-color:var(--accent);margin-top:8px}.rangeEnds{display:flex;justify-content:space-between;font-size:9px;color:var(--muted)}.toggleRow{display:flex;justify-content:space-between;align-items:center;background:var(--panel2);border:1px solid var(--border);padding:11px;border-radius:11px}.switchButton{width:46px;height:25px;border:0;border-radius:20px;background:#52525b;padding:3px;cursor:pointer}.switchButton span{display:block;width:19px;height:19px;border-radius:50%;background:#fff;transition:.2s}.switchButton.on{background:var(--success)}.switchButton.on span{transform:translateX(21px)}.measurementGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:9px}.measure{background:var(--panel2);border:1px solid var(--border);border-radius:11px;padding:11px}.measure small{display:block;color:var(--muted);font-size:10px;margin-bottom:4px}.measure b{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px}.equations{display:grid;gap:9px}.equation{background:var(--panel2);border-left:3px solid var(--accent);padding:10px 11px;border-radius:8px}.equation strong{display:block;font-family:Georgia,serif;font-size:14px}.equation code{display:block;color:var(--muted);margin-top:5px;white-space:normal}.challengeBox{border:1px solid rgba(59,130,246,.35);background:rgba(59,130,246,.07);border-radius:12px;padding:14px}.challengeBox h4{margin:0 0 7px}.challengeBox p{color:var(--muted);font-size:12px;line-height:1.5}.challengeActions{display:flex;gap:8px;flex-wrap:wrap}.result{margin-top:10px;padding:9px;border-radius:9px;font-size:12px;font-weight:700}.result.ok{background:rgba(34,197,94,.12);color:var(--success)}.result.no{background:rgba(239,68,68,.12);color:var(--error)}.learnText{color:var(--muted);font-size:13px;line-height:1.65}.lowerGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-top:15px}.infoCard{background:var(--panel);border:1px solid var(--border);border-radius:15px;padding:15px}.infoCard h3{font-size:13px;margin:0 0 10px}.infoCard p,.infoCard li{font-size:12px;color:var(--muted);line-height:1.55}.infoCard ul{padding-left:18px;margin:0}.mobileMenu{display:none}.errorBox{color:var(--error);padding:20px}.empty{color:var(--muted);font-size:12px;text-align:center;padding:30px}.kbd{border:1px solid var(--border);background:var(--panel2);padding:2px 6px;border-radius:5px;font-size:10px}.mobileShade{display:none}
      @media(max-width:980px){.shell{grid-template-columns:1fr}.sidebar{position:fixed;left:0;top:0;transform:translateX(-104%);width:min(88vw,330px);transition:.25s;box-shadow:20px 0 50px rgba(0,0,0,.4)}.sidebar.open{transform:translateX(0)}.mobileShade.show{display:block;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:19}.mobileMenu{display:inline-flex}.workspace{grid-template-columns:1fr}.controlsScroll{max-height:none}.lowerGrid{grid-template-columns:1fr 1fr}.topbar{padding:0 12px}.content{padding:14px}.titleBlock p{display:none}}
      @media(max-width:620px){.hero h2{font-size:22px}.lowerGrid{grid-template-columns:1fr}.actions .hideSmall{display:none}.diagramPanel{min-height:390px}.simCanvas{min-height:280px;padding:5px}.panelHead{padding:10px}.content{padding:10px}.measurementGrid{grid-template-columns:1fr 1fr}.topbar{height:60px}.hero{margin-top:3px}.tabs .tab{font-size:11px;padding:10px 7px}.numberWrap input{width:76px}}
    `}</style>
    <div className={`mobileShade ${mobileOpen?"show":""}`} onClick={()=>setMobileOpen(false)}/>
    <div className="shell">
      <aside className={`sidebar ${mobileOpen?"open":""}`}>
        <div className="brand"><div className="brandIcon">⚡</div><div><h1>Circuit Explorer Pro</h1><p>Interactive electricity laboratory</p></div></div>
        <input className="search" placeholder="Search 100 circuits…" value={query} onChange={e=>setQuery(e.target.value)}/>
        <div className="progressBox"><div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><b>Learning progress</b><span>{completed.size}/100</span></div><div className="progressLine"><span style={{width:`${progress}%`}}/></div></div>
        <div className="catList"><button className={`catChip ${activeCat==="all"?"active":""}`} onClick={()=>setActiveCat("all")}>All</button>{CATEGORIES.map(c=><button key={c.id} className={`catChip ${activeCat===c.id?"active":""}`} onClick={()=>setActiveCat(c.id)}>{c.icon} {c.name}</button>)}</div>
        <div className="lessonList">{filtered.length?filtered.map(c=><button key={c.id} className={`lesson ${selectedId===c.id?"active":""}`} onClick={()=>{setSelectedId(c.id);setMobileOpen(false)}}><span className="lessonNum">{c.id}</span><span className="lessonText"><b>{c.name}</b><small>{c.desc}</small></span>{completed.has(c.id)&&<span className="checkMark">✓</span>}</button>):<div className="empty">No matching circuits.</div>}</div>
      </aside>
      <main className="main">
        <header className="topbar"><div style={{display:"flex",alignItems:"center",gap:9}}><button className="iconBtn mobileMenu" onClick={()=>setMobileOpen(true)}>☰</button><div className="titleBlock"><h2>{current.name}</h2><p>Experiment {current.id} of {CIRCUITS.length}</p></div></div><div className="actions"><button className="iconBtn" title="Low-performance mode" onClick={()=>setLowPerf(x=>!x)}>{lowPerf?"🐢":"⚙"}</button><button className="iconBtn" title="Toggle theme" onClick={()=>setTheme(t=>t==="dark"?"light":"dark")}>{theme==="dark"?"☀":"☾"}</button><button className="softBtn hideSmall" onClick={reset}>Reset</button><button className="primaryBtn" onClick={()=>setRunning(r=>!r)}>{running?"Pause":"Run"}</button></div></header>
        <div className="content">
          <div className="hero"><div><div className="eyebrow">{catObj?.icon} {catObj?.name}</div><h2>{current.name}</h2><p>{current.desc}</p></div><button className={`star ${favorites.has(current.id)?"on":""}`} onClick={toggleFavorite} title="Favorite">★</button></div>
          {(danger||model.warning)&&<div className="warning"><b>Safety:</b> {model.warning||"This is an educational idealized simulation. Do not reproduce high-voltage, mains, short-circuit, or battery experiments without qualified adult supervision and proper protective equipment."}</div>}
          <div className="workspace">
            <section className="panel diagramPanel"><div className="panelHead"><h3>Live circuit and current distribution</h3><div className="simBtns"><button className="iconBtn" onClick={()=>setSimT(0)} title="Restart time">↺</button><button className="iconBtn" onClick={()=>setRunning(r=>!r)}>{running?"Ⅱ":"▶"}</button></div></div><div className="simCanvas">{model.diag}</div><div className="tabs"><button className={`tab ${tab==="experiment"?"active":""}`} onClick={()=>setTab("experiment")}>Measurements</button><button className={`tab ${tab==="graph"?"active":""}`} onClick={()=>setTab("graph")}>Graph</button><button className={`tab ${tab==="equations"?"active":""}`} onClick={()=>setTab("equations")}>Equations</button><button className={`tab ${tab==="challenge"?"active":""}`} onClick={()=>setTab("challenge")}>Challenge</button></div><div className="tabContent">{tab==="experiment"&&<div className="measurementGrid">{(model.meas||[]).map((m,i)=><div className="measure" key={i}><small>{m.l}</small><b style={{color:m.c}}>{m.v}</b></div>)}</div>}{tab==="graph"&&<SVGGraph data={model.gd||[]} data2={model.gd2} xLbl={model.xLbl||"x"} yLbl={model.yLbl||"y"} yLbl2={model.yLbl2} title={`${current.name}: live model`} marker={model.marker} lowPerf={lowPerf}/>} {tab==="equations"&&<div className="equations">{(model.eq||[]).map((e,i)=><div className="equation" key={i}><strong>{e.s}</strong><code>{e.n}</code></div>)}</div>}{tab==="challenge"&&<div className="challengeBox"><h4>Experiment challenge</h4><p>{model.ch?.t||"Explore the controls and observe how the measurements change."}</p>{hint&&model.ch&&<p><b>Hint:</b> {model.ch.h}</p>}<div className="challengeActions"><button className="primaryBtn" onClick={checkChallenge}>Check answer</button><button className="softBtn" onClick={()=>setHint(h=>!h)}>{hint?"Hide hint":"Show hint"}</button></div>{result!==null&&<div className={`result ${result?"ok":"no"}`}>{result?"Correct — experiment completed and saved.":"Not yet. Adjust the parameters and check again."}</div>}</div>}</div></section>
            <section className="panel controlsPanel"><div className="panelHead"><h3>Adjustable parameters</h3><span className="kbd">live</span></div><div className="controlsScroll">{Object.entries(params).map(([k,v])=><ParameterControl key={k} name={k} value={v} onChange={val=>updateParam(k,val)}/>)}</div></section>
          </div>
          <div className="lowerGrid"><InfoCard title="What to observe"><ul><li>Blue particles show conventional current direction and relative flow.</li><li>Change one parameter at a time and compare the live measurements.</li><li>Pause the animation when reading rapidly changing AC, RC, or RL values.</li></ul></InfoCard><InfoCard title="Model assumptions"><p>This laboratory uses idealized lumped-component equations. Real components have tolerances, temperature effects, parasitic resistance, non-linear behavior, and operating limits.</p></InfoCard><InfoCard title="Study method"><p>Predict first, adjust the control, then explain the result using the displayed equation. Complete the challenge to store progress locally on this device.</p></InfoCard></div>
        </div>
      </main>
    </div>
  </div>;
}

export default App;
