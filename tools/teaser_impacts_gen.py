import numpy as np, subprocess
SR=48000; rng=np.random.default_rng(7)
def lp(x,a):  # one-pole lowpass, a in (0,1)
    y=np.zeros_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def save(name,x):
    x=x/np.max(np.abs(x))*0.95
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','-','-c:a','libmp3lame','-b:a','192k',f'/home/claude/bidaya-videos/public/trailer/sfx/{name}.mp3'],input=x.astype(np.float32).tobytes(),check=True)
# heavy physical impact: a crack + deep noise thud + rumbling tail (no pitch, no notes)
def impact(dur=2.6):
    n=int(dur*SR); t=np.arange(n)/SR; w=rng.standard_normal(n)
    crack=w*np.exp(-t*90)
    thud=lp(w,0.01)*np.exp(-t*7)*12
    tail=lp(w,0.004)*np.exp(-t*1.6)*14
    return np.tanh(1.5*(crack*0.5+thud+tail))
# rumble like distant thunder / collapsing earth
def rumble(dur=3.2):
    n=int(dur*SR); t=np.arange(n)/SR; w=rng.standard_normal(n)
    env=(1-np.exp(-t*12))*np.exp(-t*1.2)*(1+0.4*np.sin(2*np.pi*3.1*t)*np.sin(2*np.pi*0.7*t))
    return lp(lp(w,0.006),0.02)*env*30
# rising rush of air into a hit (filtered noise, reversed tail)
def swell(dur=1.6):
    n=int(dur*SR); t=np.arange(n)/SR; w=rng.standard_normal(n)
    env=(t/dur)**3
    return (lp(w,0.05)*0.6+lp(w,0.012)*3)*env
save('own-impact',impact()); save('own-rumble',rumble()); save('own-air-swell',swell())
