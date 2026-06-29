Replace src/app/page.tsx with a landing page that converts.

Key elements: headline, GIF/demo area, install command,
3 pricing tiers, social proof, CTA.

Replace src/app/page.tsx:

import Link from 'next/link';

export default function Landing() {
  return (
    


      {/* Nav */}
      

        AgentOX
        

          GitHub
          
            Sign in
          
        

      


      {/* Hero */}
      

        

          v0.2.0 — Now with zero-git file tracking
        

        

          Switch AI agents without
re-explaining anything
        

        


          AgentOX silently tracks what every AI builds in your project.
          Switch from Claude to Cursor to Windsurf — context carries over automatically.
        


        

          

            npm install -g agentox
          

          
            Get Pro →
          
        

        


          Free CLI · VSCode Extension · Works on any folder
        


      


      {/* GIF area */}
      

        

          {/* Replace with actual GIF */}
          

            

Demo GIF goes here


            

Record with ScreenToGif


          

        

      


      {/* How it works */}
      

        
How it works

        

          {[
            { step: '01', title: 'Install once', desc: 'npm install -g agentox + VSCode extension. Done. Works on any project immediately.' },
            { step: '02', title: 'Work normally', desc: 'Use Claude, Cursor, Windsurf as you always do. AgentOX tracks everything silently.' },
            { step: '03', title: 'Switch freely', desc: 'Click Switch Agent. Context generated instantly. New AI picks up exactly where last one stopped.' }
          ].map(item => (
            

              
{item.step}

              
{item.title}

              

{item.desc}


            

          ))}
        

      


      {/* Pricing */}
      

        
Simple pricing

        

          {[
            { name: 'Free', price: '$0', period: 'forever', features: ['CLI tool', 'VSCode extension', 'Local file tracking', 'MCP server', 'Bootstrap handoff prompt'], cta: 'Get started', href: 'https://npmjs.com/package/agentox', highlight: false },
            { name: 'Pro', price: '$12', period: '/month', features: ['Everything in Free', 'Cloud sync', 'Web dashboard', '10 projects', '90-day history', 'Any machine access'], cta: 'Get Pro', href: '/auth', highlight: true },
            { name: 'Team', price: '$25', period: '/seat/month', features: ['Everything in Pro', 'Shared context', 'Team dashboard', 'Unlimited projects', '1-year history', 'Priority support'], cta: 'Get Team', href: '/auth', highlight: false }
          ].map(tier => (
            

              

                

{tier.name}


                

{tier.price}{tier.period}


              

              

                {tier.features.map(f => (
                  

                    ✓{f}
                  

                ))}
              

              
                {tier.cta}
              
            

          ))}
        

      


      {/* Footer */}
      

        


          AgentOX · GitHub · 
          Sign in
        


      

    

  );
}

━━━ VERIFY ━━━
localhost:3000 → landing page loads
"Get started" → npm package page
"Get Pro" → auth page → signup → dashboard
Pricing cards show correct prices