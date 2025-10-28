import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'
import axios from 'axios'
import { getResult, CHOICES } from '../../utils/gameLogic'
import { ensureUserProfile } from '../../lib/supabaseHelper'

export default function GamePage(){
  const [user,setUser]=useState(null)
  const [score,setScore]=useState({wins:0,losses:0,ties:0})
  const [playerChoice,setPlayerChoice]=useState('')
  const [computerChoice,setComputerChoice]=useState('')
  const [roundResult,setRoundResult]=useState(null)
  const [imgUrl,setImgUrl]=useState('')
  const [showModal,setShowModal]=useState(false)
  const [gameResult,setGameResult]=useState('')
  const router = useRouter()

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      if(!data.session) router.push('/')
      else setUser(data.session.user)
    })
  },[])

  const playGame = async (choice) => {
  const cpu = CHOICES[Math.floor(Math.random() * 3)]
  setPlayerChoice(choice)
  setComputerChoice(cpu)

  setTimeout(async () => {
    const result = getResult(choice, cpu)
    setRoundResult({ user: choice, cpu, result })

    // Update skor lokal
    const updatedScore = {
      wins: score.wins + (result === 'win' ? 1 : 0),
      losses: score.losses + (result === 'lose' ? 1 : 0),
      ties: score.ties + (result === 'tie' ? 1 : 0),
    }
    setScore(updatedScore)

    // Sync ke Supabase
    try {
      const { data: existing } = await supabase
        .from('user_game_results')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!existing) {
        await supabase.from('user_game_results').insert({
          user_id: user.id,
          win_count: result === 'win' ? 1 : 0,
          lose_count: result === 'lose' ? 1 : 0,
        })
      } else {
        await supabase
          .from('user_game_results')
          .update({
            win_count: existing.win_count + (result === 'win' ? 1 : 0),
            lose_count: existing.lose_count + (result === 'lose' ? 1 : 0),
          })
          .eq('user_id', user.id)
      }
    } catch (e) {
      console.error('Supabase update error', e)
    }

    // Check kondisi menang
    const currentWins = updatedScore.wins
    const currentLosses = updatedScore.losses

    if (currentWins >= 3) {
      try {
        // pastikan profile ada (ambil kode unik)
        const { code } = await ensureUserProfile(user)

        // cek apakah ada image dengan kode unik itu
        const { data: list } = await supabase.storage
          .from('user_images')
          .list('', { search: `${code}.png` })

        let imageUrl = ''
        if (list && list.length > 0) {
          const { data } = supabase.storage
            .from('user_images')
            .getPublicUrl(`${code}.png`)
          imageUrl = data.publicUrl
        } else {
          const { data } = supabase.storage
            .from('user_images')
            .getPublicUrl('default_win.png')
          imageUrl = data.publicUrl
        }

        setImgUrl(imageUrl)
        setGameResult('win')
        setShowModal(true)
      } catch (err) {
        console.error('Error fetch win image', err)
      }
    } else if (currentLosses >= 3) {
      setGameResult('lose')
      setShowModal(true)
    } else {
      setTimeout(() => {
        setPlayerChoice('')
        setComputerChoice('')
      }, 1200)
    }
  }, 600)
}


  const resetGame = () => {
    setPlayerChoice('')
    setComputerChoice('')
    setScore({wins:0,losses:0,ties:0})
    setShowModal(false)
    setGameResult('')
    setImgUrl('')
  }

  const quitToMenu = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen p-4"
         style={{
           backgroundImage: 'url("images/retro-clouds.png")',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      <div className="max-w-4xl mx-auto pt-4">
        <div className="mb-4 p-3 flex justify-between items-center"
             style={{
               background: 'linear-gradient(180deg, #E0E0E0 0%, #C0C0C0 100%)',
               border: '2px outset #FFFFFF',
               boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
             }}>
          <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '14px', fontWeight: 'bold' }}>
            Player: <span style={{ color: '#000080' }}>{user?.email}</span>
          </div>
          <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '14px', fontWeight: 'bold' }}>
            Score: <span style={{ color: '#008000' }}>{score.wins}</span> - <span style={{ color: '#800000' }}>{score.losses}</span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="p-4 text-center" style={{ background: '#FFFFFF', border: '2px inset #808080' }}>
            <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', color: '#000080', marginBottom: '8px' }}>Your Wins</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '48px', fontWeight: 'bold', color: '#008000' }}>{score.wins}</div>
          </div>
          <div className="p-4 text-center" style={{ background: '#FFFFFF', border: '2px inset #808080' }}>
            <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '12px', color: '#000080', marginBottom: '8px' }}>CPU Wins</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '48px', fontWeight: 'bold', color: '#800000' }}>{score.losses}</div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(180deg, #E0E0E0 0%, #C0C0C0 100%)',
          border: '2px solid #FFFFFF',
          borderRadius: '8px',
          boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.2)'
        }}>
          <div className="flex items-center justify-between px-2 py-1"
               style={{
                 background: 'linear-gradient(180deg, #0054A6 0%, #0078D4 100%)',
                 borderBottom: '1px solid #00305A'
               }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white" style={{ border: '1px solid #000' }}></div>
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
                Game Window
              </span>
            </div>
            <div className="flex gap-1">
              <button className="w-5 h-5 flex items-center justify-center text-xs font-bold" style={{ background: '#C0C0C0', border: '1px outset #E0E0E0' }}>_</button>
              <button className="w-5 h-5 flex items-center justify-center text-xs font-bold" style={{ background: '#C0C0C0', border: '1px outset #E0E0E0' }}>□</button>
              <button onClick={quitToMenu} className="w-5 h-5 flex items-center justify-center text-xs font-bold" style={{ background: '#C0C0C0', border: '1px outset #E0E0E0' }}>✕</button>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6" style={{ fontFamily: 'Arial, sans-serif', color: '#000080' }}>
              Choose Your Move
            </h2>

            {playerChoice && (
              <div className="mb-6 flex justify-around items-center p-6" style={{ background: '#FFFFFF', border: '2px inset #808080' }}>
                <div className="text-center">
                  <div className="text-6xl mb-2">{playerChoice === 'rock' ? '✊' : playerChoice === 'paper' ? '✋' : '✌️'}</div>
                  <div className="px-4 py-1 text-sm font-bold" style={{ background: 'linear-gradient(180deg, #E0E0E0 0%, #C0C0C0 100%)', border: '2px outset #FFFFFF', fontFamily: 'Tahoma, Arial, sans-serif' }}>
                    YOU
                  </div>
                </div>
                <div className="text-4xl font-bold" style={{ fontFamily: 'Arial, sans-serif', color: '#800000' }}>VS</div>
                <div className="text-center">
                  <div className="text-6xl mb-2">{computerChoice === 'rock' ? '✊' : computerChoice === 'paper' ? '✋' : '✌️'}</div>
                  <div className="px-4 py-1 text-sm font-bold" style={{ background: 'linear-gradient(180deg, #E0E0E0 0%, #C0C0C0 100%)', border: '2px outset #FFFFFF', fontFamily: 'Tahoma, Arial, sans-serif' }}>
                    CPU
                  </div>
                </div>
              </div>
            )}

<div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto">
  {[
    { label: "Rock", icon: "✊", value: "rock" },
    { label: "Paper", icon: "✋", value: "paper" },
    { label: "Scissors", icon: "✌️", value: "scissors" },
  ].map(({ label, icon, value }) => (
    <button
      key={value}
      onClick={() => playGame(value)}
      disabled={!!playerChoice}
      className="flex flex-col items-center justify-center py-6 sm:py-8 px-2 sm:px-4 text-sm sm:text-lg font-bold disabled:opacity-50 w-full aspect-square"
      style={{
        fontFamily: 'Tahoma, Arial, sans-serif',
        background: 'linear-gradient(180deg, #E0E0E0 0%, #C0C0C0 100%)',
        border: '2px outset #FFFFFF',
        boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
      }}
    >
      <div className="text-4xl sm:text-5xl mb-1 sm:mb-2 leading-none">{icon}</div>
      <span className="text-xs sm:text-base whitespace-nowrap">{label}</span>
    </button>
  ))}
</div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button onClick={quitToMenu} className="px-6 py-2 text-sm font-bold" style={{ fontFamily: 'Tahoma, Arial, sans-serif', background: 'linear-gradient(180deg, #E0E0E0 0%, #C0C0C0 100%)', border: '2px outset #FFFFFF', boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
            Exit Game
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="w-full max-w-md" style={{ background: 'linear-gradient(180deg, #E0E0E0 0%, #C0C0C0 100%)', border: '2px solid #FFFFFF', borderRadius: '8px', boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.3), 4px 4px 0 rgba(0,0,0,0.3)' }}>
              <div className="flex items-center justify-between px-2 py-1" style={{ background: 'linear-gradient(180deg, #0054A6 0%, #0078D4 100%)', borderBottom: '1px solid #00305A' }}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white" style={{ border: '1px solid #000' }}></div>
                  <span className="text-white font-bold text-sm" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
                    {gameResult === 'win' ? 'Victory!' : 'Game Over'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {gameResult === 'win' ? (
                  <div>
                    <div className="p-8 mb-4 text-center" style={{ background: '#FFFFFF', border: '2px inset #808080' }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt="Victory" className="w-full h-64 object-cover rounded" />
                      ) : (
                        <>
                          <div className="text-8xl mb-4">🏆</div>
                          <div className="text-6xl">🎉</div>
                        </>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold mb-3 text-center" style={{ fontFamily: 'Arial, sans-serif', color: '#000080' }}>You Win!</h2>
                    <p className="text-lg text-center mb-6" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>Congratulations! You defeated the computer!</p>
                  </div>
                ) : (
                  <div>
                    <div className="p-8 mb-4 text-center" style={{ background: '#FFFFFF', border: '2px inset #808080' }}>
                      <div className="text-8xl mb-4">💔</div>
                      <div className="text-6xl">😢</div>
                    </div>
                    <h2 className="text-3xl font-bold mb-3 text-center" style={{ fontFamily: 'Arial, sans-serif', color: '#800000' }}>Game Over</h2>
                    <p className="text-lg text-center mb-6" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>Better luck next time!</p>
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  <button onClick={resetGame} className="px-6 py-2 text-sm font-bold" style={{ fontFamily: 'Tahoma, Arial, sans-serif', background: 'linear-gradient(180deg, #E0E0E0 0%, #C0C0C0 100%)', border: '2px outset #FFFFFF', boxShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>Play Again</button>
                  <button onClick={quitToMenu} className="px-6 py-2 text-sm font-bold" style={{ fontFamily: 'Tahoma, Arial, sans-serif', background: 'linear-gradient(180deg, #E0E0E0 0%, #C0C0C0 100%)', border: '2px outset #FFFFFF', boxShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>Exit</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
