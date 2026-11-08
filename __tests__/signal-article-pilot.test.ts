import manifest from '@/content/signal-pilot.json';
import { checkedPilot, registerPilotArticle, playableAudio, transcriptHash } from '@/app/lib/signal-pilot';

// Unit cases use an article awaiting narration, independent of whether the
// shipped pilot recordings have already been generated.
const original={...manifest.articles[0],audio:undefined};
const article=(index:number)=>({...original,slug:`article-${index}`,sourcePath:`/blog/article-${index}`});
describe('The bounded Signal audio pilot',()=>{
  it('counts existing articles and refuses a thirty-first unique article',()=>{
    expect(checkedPilot(manifest.articles).length).toBeLessThanOrEqual(30);
    const full=Array.from({length:30},(_,i)=>article(i));
    expect(registerPilotArticle(full,full[0])).toHaveLength(30);
    expect(()=>registerPilotArticle(full,article(31))).toThrow('30 total');
  });
  it('preserves identity and rejects duplicate or unrelated source enrollment',()=>{
    expect(()=>checkedPilot([original,original])).toThrow('unique');
    expect(()=>registerPilotArticle([original],{...original,slug:'replacement'})).toThrow('identity');
    expect(()=>checkedPilot([{...original,sourcePath:'https://external.invalid/post'}])).toThrow('published OfRoot');
  });
  it('invalidates old audio after a correction and never accepts an unrelated audio URL',()=>{
    const record={...original,audio:{path:'/audio/signal-pilot/example.mp3',transcriptHash:transcriptHash(original),sha256:'a'.repeat(64),durationSeconds:25}};
    expect(playableAudio(record)).not.toBeNull();
    expect(playableAudio({...record,summary:'Corrected text.'})).toBeNull();
    expect(playableAudio({...record,audio:{...record.audio,path:'https://external.invalid/audio.mp3'}})).toBeNull();
    expect(playableAudio(original)).toBeNull();
  });
});
