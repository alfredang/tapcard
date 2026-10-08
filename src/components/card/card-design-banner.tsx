import { getTheme, type ThemeKey } from "@/lib/themes";

export const DESIGN_NAMES: Record<ThemeKey, string> = {
  CORPORATE: "Executive Lines", MODERN: "Orbit", MINIMALIST: "Editorial", DARK: "Blueprint",
  CREATIVE: "Confetti", LUXURY: "Gold Frame", OCEAN: "Ocean Waves", FOREST: "Alpine",
  SUNSET: "Golden Hour", ROSE: "Petal Rings", INDIGO: "Prism", TEAL: "Flow",
  AMBER: "Sunburst", CRIMSON: "Velocity", LAVENDER: "Soft Bloom", MIDNIGHT: "Constellation",
  SKY: "Cloudscape", MINT: "Dot Studio", PEACH: "Ribbon", GRAPHITE: "Facet",
};

/** Scalable decorative artwork matching the native iOS template gallery. */
export function CardDesignBanner({ theme }: { theme?: string | null }) {
  const t = getTheme(theme);
  const lines = (points: string, width = 1.5, opacity = .28) =>
    <polyline points={points} fill="none" stroke="white" strokeWidth={width} opacity={opacity} />;
  const circle = (x: number, y: number, r: number, fill = false) =>
    <circle cx={x} cy={y} r={r} fill={fill ? "white" : "none"} stroke={fill ? "none" : "white"} strokeWidth="1.5" opacity={fill ? .16 : .28} />;
  const sequence = (n: number, render: (i: number) => React.ReactNode) =>
    Array.from({ length: n }, (_, i) => <g key={i}>{render(i)}</g>);
  let art;
  switch (t.key) {
    case "CORPORATE": art = sequence(8, i => lines(`${i*50},0 ${i*50+136},136`)); break;
    case "MODERN": art = <>{circle(246,34,109,true)}{circle(45,136,88)}</>; break;
    case "MINIMALIST": art = <><rect x="14" y="14" width="272" height="108" fill="none" stroke="black" opacity=".25" />{lines("210,0 210,136",1.5,.7)}</>; break;
    case "DARK": art = <>{sequence(15,i=>lines(`${i*22},0 ${i*22},136`,1,.1))}{sequence(7,i=>lines(`0,${i*22} 300,${i*22}`,1,.1))}</>; break;
    case "CREATIVE": art=sequence(8,i=><>{circle(i*43,41,16,i%2===0)}{lines(`${i*43},95 ${i*43+12},122`,5)}</>); break;
    case "LUXURY": art=<>{[9,16].map(i=><rect key={i} x={i} y={i} width={300-i*2} height={136-i*2} fill="none" stroke="#f0d27a" opacity=".75" />)}</>; break;
    case "OCEAN": case "TEAL": art=sequence(5,i=><path d={`M0 ${34+i*24} C90 ${-34+i*24} 195 ${102+i*24} 300 ${34+i*24}`} fill="none" stroke="white" opacity={t.key === "OCEAN" ? .26 : .4} strokeWidth={t.key === "OCEAN" ? 2 : 5} />); break;
    case "FOREST": art=sequence(7,i=>lines(`${i*50-35},136 ${i*50},20 ${i*50+35},136`,2)); break;
    case "SUNSET": art=<>{circle(225,61,65,true)}{sequence(5,i=>lines(`0,${82+i*10} 300,${82+i*10}`,1.5,.35))}</>; break;
    case "ROSE": art=sequence(5,i=>circle(60+i*45,68,49)); break;
    case "INDIGO": art=sequence(7,i=>lines(`${i*50-25},0 ${i*50+25},68 ${i*50-25},136`,3)); break;
    case "AMBER": art=sequence(13,i=>lines(`150,136 ${150+Math.cos(i*Math.PI/12)*300},${136-Math.sin(i*Math.PI/12)*300}`,1.5,.35)); break;
    case "CRIMSON": art=sequence(6,i=>lines(`${i*60-40},0 ${i*60+20},136`,18,.18)); break;
    case "LAVENDER": art=sequence(4,i=>circle(60+i*66,68,68,true)); break;
    case "MIDNIGHT": art=<>{sequence(30,i=>circle((i*67)%301,(i*37)%101/101*136,i%5===0?2.5:1,true))}{lines("30,95 105,41 195,75 270,20")}</>; break;
    case "SKY": art=sequence(5,i=>circle(i*75,116,61,true)); break;
    case "MINT": art=sequence(13,x=>sequence(6,y=>circle(10+x*24,10+y*24,2,true))); break;
    case "PEACH": art=sequence(6,i=>lines(`${i*60-25},0 ${i*60+25},136`,28,.3)); break;
    case "GRAPHITE": art=sequence(8,i=>lines(`${i*43-35},136 ${i*43},0 ${i*43+35},136`,1.5,.22)); break;
  }
  return <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 300 136" preserveAspectRatio="none">{art}</svg>;
}
