/* Qur'an AI recitation checker. Runs Tarteel's whisper-base-ar-quran (Apache-2.0) on the phone
   with transformers.js. Audio never leaves the device. */
import {AutoProcessor,AutoTokenizer,WhisperForConditionalGeneration,Tensor,env} from './tf.js?v=2';
env.allowLocalModels=false;env.useBrowserCache=true;
env.backends.onnx.wasm.wasmPaths=new URL('./',import.meta.url).href;
env.backends.onnx.wasm.numThreads=self.crossOriginIsolated?Math.min(4,navigator.hardwareConcurrency||2):1;
const H=new URL(import.meta.url).searchParams.get('host');if(H)env.remoteHost=H;
const ID='aaqibhabib/whisper-base-ar-quran-onnx',PRE=[50258,50272,50359,50363],EOS=50257;
let P=null,T=null,M=null,E=null,dev='wasm',q=Promise.resolve();
const post=m=>self.postMessage(m);
async function load(prefer){
  let gpu=false;if(prefer!=='wasm'&&navigator.gpu){try{const a=await navigator.gpu.requestAdapter();gpu=!!a&&a.features.has('shader-f16')}catch(e){}}
  const files={},progress_callback=x=>{if(x.status==='progress'&&x.file){files[x.file]=[x.loaded||0,x.total||0];let l=0,t=0;for(const k in files){l+=files[k][0];t+=files[k][1]}post({t:'prog',l,tot:t})}};
  P=await AutoProcessor.from_pretrained(ID,{progress_callback});T=await AutoTokenizer.from_pretrained(ID,{progress_callback});
  const get=g=>WhisperForConditionalGeneration.from_pretrained(ID,g?{device:{encoder_model:'webgpu',decoder_model_merged:'wasm'},dtype:{encoder_model:'fp16',decoder_model_merged:'q8'},progress_callback}:{device:'wasm',dtype:'q8',progress_callback});
  try{M=await get(gpu);dev=gpu?'webgpu':'wasm'}catch(e){if(!gpu)throw e;M=await get(false);dev='wasm'}
  const t=performance.now();await encode(new Float32Array(16000));await forced(['بِسْمِ']);post({t:'ready',dev,warm:Math.round(performance.now()-t)})}
const free=t=>{try{t&&t.dispose&&t.dispose()}catch(e){}};
async function encode(a){if(E){free(E.input_features);free(E.eo);E=null}const{input_features}=await P(a);
  const mi=await M._prepare_encoder_decoder_kwargs_for_generation({inputs_tensor:input_features,model_inputs:{input_features},model_input_name:'input_features',generation_config:M.generation_config});
  E={input_features,eo:mi.encoder_outputs}}
async function logits(ids){const di=new Tensor('int64',BigInt64Array.from(ids.map(BigInt)),[1,ids.length]);
  const o=await M({input_features:E.input_features,encoder_outputs:E.eo,decoder_input_ids:di});free(di);for(const k in o)if(k!=='logits'&&k!=='encoder_outputs')free(o[k]);return{d:o.logits.data,V:o.logits.dims[2],t:o.logits}}
function lse(d,V,p){const o=p*V;let m=-Infinity;for(let v=0;v<V;v++)if(d[o+v]>m)m=d[o+v];let z=0;for(let v=0;v<V;v++)z+=Math.exp(d[o+v]-m);return m+Math.log(z)}
const enc=(w,first)=>T.encode((first?'':' ')+w,{add_special_tokens:false});
/* score the expected words in one pass: how many were recited, and how sure the model is of each */
async function forced(words){const sp=[],ids=PRE.slice();for(const w of words){const x=enc(w,!sp.length);sp.push([ids.length,ids.length+x.length]);ids.push(...x)}
  const{d,V,t}=await logits(ids),Z=new Float64Array(ids.length);for(let p=0;p<ids.length;p++)Z[p]=lse(d,V,p);const lp=(p,t)=>d[p*V+t]-Z[p];
  const ws=sp.map(([s,e])=>{let x=0;for(let p=s;p<e;p++)x+=lp(p-1,ids[p]);return x});
  let best=-Infinity,n=0,cum=0,be=0;for(let j=0;j<=words.length;j++){const e=lp((j?sp[j-1][1]:PRE.length)-1,EOS),s=cum+e;if(s>best){best=s;n=j;be=e}if(j<words.length)cum+=ws[j]}
  free(t);return{n,ws:ws.slice(0,n).map(x=>Math.round(x*10)/10),eos:Math.round(be*10)/10}}
async function seqScore(words){const ids=PRE.concat(enc(words.join(' '),true),[EOS]),{d,V,t}=await logits(ids);let s=0;for(let p=PRE.length;p<ids.length;p++)s+=d[(p-1)*V+ids[p]]-lse(d,V,p-1);free(t);return s}
async function gen(pre){const init=PRE.concat(pre&&pre.length?enc(pre.join(' '),true):[]);const g=await M.generate({inputs:E.input_features,encoder_outputs:E.eo,decoder_input_ids:init,max_new_tokens:200});const out=T.decode(Array.from(g.tolist()[0]).map(Number),{skip_special_tokens:true}).trim();free(g);return out}
async function handle(m){try{
  if(m.t==='load'){if(!M)await load(m.prefer);else post({t:'ready',dev,warm:0});return}
  if(m.t==='check'){const t0=performance.now();await encode(m.audio);const r={t:'res',id:m.id,te:Math.round(performance.now()-t0)};
    if(m.exp&&m.exp.length){const t1=performance.now();const f=await forced(m.exp);r.tf=Math.round(performance.now()-t1);Object.assign(r,f);r.ok=f.n>0&&f.eos>-4&&f.ws.every(x=>x>-5)}
    if(!r.ok&&m.gen!==false){let k=0;if(r.ws){k=r.ws.findIndex(x=>x<=-5);if(k<0)k=r.n}r.k=k;r.hyp=await gen(k?m.exp.slice(0,k):null)}r.ms=Math.round(performance.now()-t0);post(r);return}
  if(m.t==='verify'){const b=await seqScore(m.base),d=[];for(const a of m.alts)d.push(Math.round(((await seqScore(a))-b)*10)/10);post({t:'res',id:m.id,d});return}
}catch(e){if(m.t==='check'&&dev==='webgpu'&&!m.retry){try{M=null;await load('wasm');m.retry=1;return handle(m)}catch(x){}}post({t:m.t==='load'?'err':'res',id:m.id,err:String(e&&e.message||e)})}}
self.onmessage=e=>{const m=e.data;q=q.then(()=>handle(m))};
