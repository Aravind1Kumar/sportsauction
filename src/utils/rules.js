// Exact tiered bid increment formula from playauctiongame.com client bundle (58d6d8a9e103ab07.js)
// Stored in Lakhs:
// < 100L (< 1.00 Cr): +5L (0.05 Cr)
// 100L - 199L (1.00 - 1.99 Cr): +10L (0.10 Cr)
// 200L - 499L (2.00 - 4.99 Cr): +20L (0.20 Cr)
// >= 500L (>= 5.00 Cr): +25L (0.25 Cr)
export function getNextBidIncrement(currentPrice) {
  const priceInLakhs = Math.round(currentPrice * 100);

  if (priceInLakhs < 100) {
    return 0.05; // +5 Lakhs
  } else if (priceInLakhs < 200) {
    return 0.10; // +10 Lakhs
  } else if (priceInLakhs < 500) {
    return 0.20; // +20 Lakhs
  } else {
    return 0.25; // +25 Lakhs
  }
}

export function formatMoney(amountInCrores) {
  if (amountInCrores === null || amountInCrores === undefined) return '₹0.00 Cr';
  const priceInLakhs = Math.round(amountInCrores * 100);
  if (priceInLakhs < 100) {
    return `₹${priceInLakhs} L`;
  }
  return `₹${amountInCrores.toFixed(2)} Cr`;
}

// playauctiongame.com enforces:
// 1. squad.length < team.maxSquad (default 25)
// 2. if isOverseas, team.overseasCount < 8
// 3. nextBid <= team.purse (teams can spend down to full purse without artificial reserves)
export function canTeamBid(team, nextPrice, player) {
  if (!team) return false;

  if (player.isOverseas && team.overseasCount >= 8) {
    return false;
  }

  if (team.squad.length >= 25) {
    return false;
  }

  if (nextPrice > team.purse) {
    return false;
  }

  return true;
}

export function decideBotBid(botTeam, player, currentPrice, currentBidderId) {
  if (currentBidderId === botTeam.id) return false;

  const nextIncrement = currentPrice === 0 ? player.basePrice : getNextBidIncrement(currentPrice);
  const nextPrice = currentPrice === 0 
    ? player.basePrice 
    : Math.round((currentPrice + nextIncrement) * 100) / 100;

  if (!canTeamBid(botTeam, nextPrice, player)) return false;

  // Valuation model calibrated with franchise purse & needs
  let valuation = player.basePrice * (player.tier === 1 ? 3.5 : 2.0);

  const role = player.role;
  const roleCount = botTeam.squad.filter(p => p.role === role).length;

  if (role === 'Wicket-Keeper' && roleCount >= 2) valuation *= 0.6;
  if (role === 'Bowler' && roleCount < 5) valuation *= 1.3;
  if (role === 'Batter' && roleCount < 5) valuation *= 1.3;
  if (role === 'All-Rounder' && roleCount < 4) valuation *= 1.35;

  if (player.isOverseas && botTeam.overseasCount >= 6) {
    valuation *= 0.7;
  }

  // Cap bid at remaining purse
  valuation = Math.min(valuation, botTeam.purse);

  return nextPrice <= valuation;
}
