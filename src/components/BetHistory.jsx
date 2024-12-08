'use client'

import { useState, useEffect, useCallback } from 'react'
import { History } from 'lucide-react'

const generateRandomBet = () => {
  const users = ['User 1', 'User 2', 'User 3', 'User 4', 'User 5', 'User 6', 'User 7', 'User 8', 'User 9', 'User 10']
  const colors = ['1abc9c', '3498db', 'e74c3c', 'f1c40f', '8e44ad', '2ecc71', '34495e', '16a085', '27ae60', 'd35400']
  const user = users[Math.floor(Math.random() * users.length)]
  const color = colors[Math.floor(Math.random() * colors.length)]
  const bet = Math.floor(Math.random() * 900) + 100
  const multiplier = parseFloat((Math.random() * 2 + 1).toFixed(2))
  const cashOut = Math.floor(bet * multiplier)

  return {
    user,
    bet,
    multiplier,
    cashOut,
    image: `https://via.placeholder.com/40/${color}`
  }
}

export default function BetHistory() {
  const [activeTab, setActiveTab] = useState('all')
  const [allBets, setAllBets] = useState([])
  const [myBets, setMyBets] = useState([])
  const [topBets, setTopBets] = useState([])

  const addNewBet = useCallback(() => {
    const newBet = generateRandomBet()
    setAllBets(prevBets => [newBet, ...prevBets.slice(0, 19)])
    
    if (Math.random() < 0.2) {  // 20% chance for a bet to be "my bet"
      setMyBets(prevBets => [newBet, ...prevBets.slice(0, 4)])
    }
    
    setTopBets(prevBets => {
      const updatedBets = [...prevBets, newBet].sort((a, b) => b.cashOut - a.cashOut).slice(0, 5)
      return updatedBets
    })
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      addNewBet()
    }, 2000)  // Add a new bet every 2 seconds

    return () => clearInterval(timer)
  }, [addNewBet])

  const getTabData = () => {
    if (activeTab === 'all') return allBets
    if (activeTab === 'my') return myBets
    if (activeTab === 'top') return topBets
    return []
  }

  return (
    <div className="relative w-full bg-gray-900 text-white min-h-[115vh]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <div className="flex gap-4">
          {['all', 'my', 'top'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'all' && 'All Bets'}
              {tab === 'my' && 'My Bets'}
              {tab === 'top' && 'Top'}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <History className="w-4 h-4" />
          Previous hand
        </button>
      </div>

      <div className="grid grid-cols-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
        <div>User</div>
        <div className="text-right">Bet INR</div>
        <div className="text-center">X</div>
        <div className="text-right">Cash out INR</div>
      </div>

      <div className="overflow-y-auto max-h-[1000px]">
        <table className="w-full text-sm text-gray-400">
          <tbody>
            {getTabData().map((item, index) => (
              <tr
                key={index}
                className={`border-b border-gray-800 flex items-center justify-between py-2 ${
                  index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'
                }`}
              >
                <td className="px-6 py-2 w-2/7 flex items-center gap-2">
                  <img src={item.image} alt={item.user} className="w-6 h-6 rounded-full" />
                  {item.user}
                </td>
                <td
                  className={`px-3 py-1 text-center text-gray-200 rounded-full flex ${
                    ['bg-red-600', 'bg-blue-700', 'bg-green-500', 'bg-yellow-500', 'bg-purple-700'][index % 5]
                  }`}
                  style={{
                    display: 'inline-block',
                    minWidth: '3rem',
                    height: 'fit-content',
                    padding: '0.5rem 1rem',
                    lineHeight: '1rem',
                  }}
                >
                  {item.bet}
                </td>
                <td className="px-4 py-2 text-center">{item.multiplier.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{item.cashOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="absolute bottom-0 flex w-full items-center justify-between px-4 py-2 text-xs text-gray-400 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <span>This game is</span>
          <div className="flex items-center gap-1 text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Provably Fair
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Powered by</span>
          <span className="font-bold">SPRIBE</span>
        </div>
      </div>
    </div>
  )
}

