# Self-made sound effects for Episode 1 (no music, no pitch melodies): hooves, wings, stone rain, elephant.
import numpy as np, subprocess
SR=48000; rng=np.random.default_rng(11)
def lp(x,a):
    y=np.zeros_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def save(name,x):
    x=x/np.max(np.abs(x))*0.9
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','-','-c:a','libmp3lame','-b:a','192k',f'/home/claude/bidaya-videos/public/trailer/sfx/{name}.mp3'],input=x.astype(np.float32).tobytes(),check=True)
def thud(dur=0.09,a=0.02,k=60):
    n=int(dur*SR); t=np.arange(n)/SR; w=rng.standard_normal(n)
    return lp(w,a)*np.exp(-t*k)*8 + w*np.exp(-t*400)*0.15
# galloping hooves on sand: 4-beat gallop pattern, 6 s, loopable
n=int(6*SR); x=np.zeros(n); step=0.42
t0=0.0
while t0<6-0.4:
    for off,amp in ((0,1),(0.07,0.8),(0.16,0.9),(0.22,0.7)):
        s=thud()*amp*(0.8+0.4*rng.random()); j=int((t0+off)*SR); x[j:j+len(s)]+=s[:n-j]
    t0+=step
x+=lp(rng.standard_normal(n),0.02)*0.3
save('own-hooves',x)
# a flock of wings: many flutters (amplitude-modulated noise) + air
n=int(8*SR); t=np.arange(n)/SR; x=np.zeros(n)
for b in range(60):
    f=9+rng.random()*7; ph=rng.random()*6; st=rng.random()*7; ln=0.6+rng.random()*1.5
    m=(t>st)&(t<st+ln)
    env=np.zeros(n); env[m]=np.sin(np.pi*(t[m]-st)/ln)
    flap=np.clip(np.sin(2*np.pi*f*t+ph),0,1)**3
    x+=rng.standard_normal(n)*flap*env*(0.3+rng.random()*0.4)
x=lp(x,0.25)+lp(rng.standard_normal(n),0.05)*np.minimum(1,t/1.5)*0.6
save('own-wings',x)
# stones raining: hundreds of tiny ticks and thuds over 6 s
n=int(6*SR); x=np.zeros(n)
for k in range(700):
    st=int(rng.random()*(n-SR*0.1)); tick=rng.standard_normal(int(0.02*SR))*np.exp(-np.arange(int(0.02*SR))/SR*300)*(0.2+rng.random()*0.5)
    if rng.random()<0.25: tick=thud(0.06,0.05,90)*0.4
    x[st:st+len(tick)]+=tick
save('own-stones',x)
# elephant: low growl rumble with breathy noise (no musical pitch)
n=int(2.5*SR); t=np.arange(n)/SR
base=lp(rng.standard_normal(n),0.004)*40
am=1+0.5*np.sin(2*np.pi*18*t)
env=(1-np.exp(-t*6))*np.exp(-t*1.2)
save('own-elephant-rumble',np.tanh(base*am*env))
