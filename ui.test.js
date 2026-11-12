const {JSDOM}=require('jsdom'); const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','WalkForLife.html'),'utf8');
let confirms=0, res=[]; const ok=(n,c,x='')=>{res.push((c?'OK  ':'FALLA ')+n+(c?'':'  -> '+x));};
function mk(pre){return new JSDOM(html,{runScripts:'dangerously',url:'https://localhost/',pretendToBeVisual:true,beforeParse(w){
  w.tailwind={};w.Chart=class{destroy(){}}; w.jspdf={jsPDF:function(){return new Proxy({},{get:()=>()=>({})})}};
  w.HTMLCanvasElement.prototype.getContext=()=>({}); w.confirm=()=>{confirms++;return true;}; w.alert=()=>{};
  w.Element.prototype.scrollIntoView=()=>{}; w.scrollTo=()=>{}; w.matchMedia=()=>({matches:false});
  if(pre)w.localStorage.setItem('walkforlife_data_v1',pre);}});}
const tick=()=>new Promise(r=>setTimeout(r,30));
async function setv(w,id,v,ev='input'){const e=w.document.getElementById(id);e.value=v;e.dispatchEvent(new w.Event(ev,{bubbles:true}));await tick();}
const $=(w,id)=>w.document.getElementById(id), hid=(w,id)=>$(w,id).classList.contains('hidden'), pd=(w,k)=>w.eval('planData.'+k);
(async()=>{
 // 1 bajo peso
 let d=mk(),w=d.window; await tick();
 await setv(w,'altura','165'); await setv(w,'pesoActual','45'); await setv(w,'edad','30'); await setv(w,'sexo','mujer','change');
 ok('bajo peso: casilla oculta, aviso visible',w.document.getElementById('modoGanancia').closest('div').classList.contains('hidden')&&!hid(w,'gananciaAviso'));
 ok('bajo peso: tarjeta ideal + autorrelleno 54.5 / 6 meses',!hid(w,'objetivoIdealCard')&&$(w,'pesoObjetivo').value==='54.5'&&$(w,'meses').value==='6',$(w,'pesoObjetivo').value+'/'+$(w,'meses').value);
 w.generarPlan(); await tick();
 ok('bajo peso: plan ganancia con superávit',pd(w,'tipoPlan')==='ganancia'&&pd(w,'deficit')<0&&pd(w,'calObjetivo')>pd(w,'tdee'),JSON.stringify([pd(w,'tipoPlan'),pd(w,'deficit')]));
 ok('bajo peso: etiqueta y render',w.eval('etiquetaPlan(planData)').includes('bajo peso')&&$(w,'evaluacionContent').innerHTML.includes('Kg a ganar'));
 const raw=w.localStorage.getItem('walkforlife_data_v1');
 // 6 plan desactualizado
 await setv(w,'pesoActual','46'); ok('plan desactualizado visible',$(w,'planDesactualizado').style.display==='flex');
 await setv(w,'pesoActual','45'); ok('al revertir desaparece',$(w,'planDesactualizado').style.display==='none');
 // 5 ritmo excesivo ganancia
 await setv(w,'pesoObjetivo','55'); await setv(w,'meses','2','change'); w.generarPlan(); await tick();
 ok('ritmo excesivo ganancia: alerta, 0.4 kg/sem y meses ampliados',!hid(w,'alertaSeguridad')&&pd(w,'perdidaSemanal')===0.4&&pd(w,'meses')>2&&pd(w,'mesesSolicitados')===2,JSON.stringify([pd(w,'perdidaSemanal'),pd(w,'meses')]));
 // 2 sobrepeso
 d=mk(); w=d.window; await tick(); await setv(w,'altura','170'); await setv(w,'pesoActual','90'); await setv(w,'edad','40'); await setv(w,'sexo','hombre','change');
 ok('sobrepeso: ideal 71.9 / 6 meses, casilla oculta',$(w,'pesoObjetivo').value==='71.9'&&$(w,'meses').value==='6'&&hid(w,'modoGananciaDiv'));
 await setv(w,'grasaDirecta','30'); w.generarPlan(); await tick();
 ok('sobrepeso: pérdida con déficit',pd(w,'tipoPlan')==='perdida'&&pd(w,'deficit')>0);
 ok('primer plan incluye % grasa',pd(w,'grasaPct')===30,String(pd(w,'grasaPct')));
 ok('dieta pérdida: lista limitar con zumos',$(w,'dietaContent').innerHTML.includes('Zumos de fruta'));
 // 3 obesidad por fases
 d=mk(); w=d.window; await tick(); await setv(w,'altura','170'); await setv(w,'pesoActual','140');
 ok('obesidad: fase 12 meses hasta 101.0',$(w,'pesoObjetivo').value==='101.0'&&$(w,'meses').value==='12'&&$(w,'objetivoIdealCard').innerHTML.includes('primera fase'),$(w,'pesoObjetivo').value);
 // 4 normopeso
 d=mk(); w=d.window; await tick(); await setv(w,'altura','175'); await setv(w,'pesoActual','70');
 ok('normopeso: sin tarjeta, casilla visible',hid(w,'objetivoIdealCard')&&!hid(w,'modoGananciaDiv')&&!w.document.getElementById('modoGanancia').closest('div').classList.contains('hidden'));
 // 7 IMC<16
 d=mk(); w=d.window; await tick(); await setv(w,'altura','165'); await setv(w,'pesoActual','38'); await setv(w,'edad','25'); await setv(w,'sexo','mujer','change');
 ok('IMC<16: aviso rojo visible',!hid(w,'avisosClinicos')&&$(w,'avisosClinicos').innerHTML.includes('delgadez severa'));
 const c0=confirms; w.generarPlan(); await tick(); ok('IMC<16: confirm antes de generar',confirms>c0);
 // 8 datos previos
 d=mk(raw); w=d.window; await tick();
 ok('datos previos: modal visible y nada restaurado',!hid(w,'modalDatosPrevios')&&$(w,'altura').value===''&&$(w,'resumenDatosPrevios').innerHTML.includes('kg'));
 await setv(w,'nombre','x'); ok('sin decidir no se sobrescribe el guardado',w.localStorage.getItem('walkforlife_data_v1')===raw);
 w.continuarConDatosPrevios(); await tick();
 ok('continuar: restaura datos y plan',$(w,'altura').value==='165'&&!hid(w,'resultados')&&hid(w,'modalDatosPrevios'));
 d=mk(raw); w=d.window; await tick(); w.empezarDeCero(); await tick();
 ok('borrar: vacía almacenamiento',w.localStorage.getItem('walkforlife_data_v1')===null&&hid(w,'modalDatosPrevios'));
 // plan de ganancia antiguo (hipocalórico) se normaliza
 const old=JSON.parse(raw); old.planData.deficit=500; old.planData.calObjetivo=old.planData.tdee-500; old.planData.perdidaTotal=-9.5; old.planData.perdidaSemanal=-0.3;
 d=mk(JSON.stringify(old)); w=d.window; await tick(); w.continuarConDatosPrevios(); await tick();
 ok('plan ganancia antiguo se recalcula con superávit',pd(w,'deficit')<0&&pd(w,'calObjetivo')>pd(w,'tdee'),String(pd(w,'deficit')));

 // --- Fase 2: cribado, suelo, Katch ---
 const chk=async(w,id)=>{const e=$(w,id);e.checked=true;e.dispatchEvent(new w.Event('change',{bubbles:true}));await tick();};
 const base=async(w,alt,pes,sex='mujer')=>{await setv(w,'altura',alt);await setv(w,'pesoActual',pes);await setv(w,'edad','35');await setv(w,'sexo',sex,'change');};
 d=mk(); w=d.window; await tick(); await base(w,'165','45'); await chk(w,'cr-embarazo'); w.generarPlan(); await tick();
 ok('embarazo: bloqueo visible, sin plan',w.document.getElementById('bloqueoCribado').style.display!=='none'&&!pd(w,'pesoActual')&&hid(w,'resultados'));
 d=mk(); w=d.window; await tick(); await base(w,'165','45'); await chk(w,'cr-tca'); w.generarPlan(); await tick();
 ok('TCA: bloqueo también en ganancia',!pd(w,'pesoActual'));
 d=mk(); w=d.window; await tick(); await base(w,'170','90'); await chk(w,'cr-insulina'); const c1=confirms; w.generarPlan(); await tick();
 ok('insulina: pide confirmación, genera plan y deja aviso',confirms>c1&&pd(w,'pesoActual')&&pd(w,'avisos').some(a=>a.includes('hipoglucemia')));
 d=mk(); w=d.window; await tick(); await base(w,'170','90'); await chk(w,'cr-renal'); w.generarPlan(); await tick();
 ok('renal: banner y ⛔ en alta proteína',$(w,'dietaContent').innerHTML.includes('Enfermedad renal')&&$(w,'dietaContent').innerHTML.includes('Alta proteína ⛔'));
 const raw2=w.localStorage.getItem('walkforlife_data_v1');
 d=mk(raw2); w=d.window; await tick(); w.continuarConDatosPrevios(); await tick();
 ok('cribado se guarda y se restaura',$(w,'cr-renal').checked===true);
 await chk(w,'cr-tca'); ok('cambiar el cribado marca el plan como desactualizado',$(w,'planDesactualizado').style.display==='flex');
 d=mk(); w=d.window; await tick(); await base(w,'170','90','hombre'); await setv(w,'grasaDirecta','30'); w.generarPlan(); await tick();
 ok('Katch-McArdle cuando hay % de grasa',pd(w,'tmbMetodo')==='Katch-McArdle'&&$(w,'evaluacionContent').innerHTML.includes('Katch-McArdle'),pd(w,'tmbMetodo'));
 ok('TDEE incluye ejercicio y factor visible',pd(w,'gastoEjercicio')>0&&$(w,'evaluacionContent').innerHTML.includes('ejercicio +'));
 d=mk(); w=d.window; await tick(); await base(w,'150','52'); await setv(w,'pesoObjetivo','45'); await setv(w,'meses','1','change'); w.generarPlan(); await tick();
 ok('suelo 1.200 en mujer y aviso de mínimo',pd(w,'calObjetivo')>=Math.min(1200,pd(w,'tdee'))&&pd(w,'deficit')>=0&&(!pd(w,'pisoAplicado')||pd(w,'avisos').some(a=>a.includes('Mínimo calórico'))),JSON.stringify([pd(w,'calObjetivo'),pd(w,'tdee'),pd(w,'avisos')]));
 console.log(res.join('\n')); console.log(res.filter(x=>x.startsWith('FALLA')).length+' fallos de '+res.length);
 process.exit(0);
})().catch(e=>{console.log('ERROR',e);process.exit(1)});
