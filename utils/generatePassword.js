import crypto from 'crypto';

export const genererMotDePasse = (longueur = 10) => {
  const majuscules = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const minuscules = 'abcdefghijklmnopqrstuvwxyz';
  const chiffres = '0123456789';
  const speciaux = '@#$%&*!?';

  const tous = majuscules + minuscules + chiffres + speciaux;
  let motDePasse = '';

  // Garantir au moins un de chaque type
  motDePasse += majuscules[crypto.randomInt(majuscules.length)];
  motDePasse += minuscules[crypto.randomInt(minuscules.length)];
  motDePasse += chiffres[crypto.randomInt(chiffres.length)];
  motDePasse += speciaux[crypto.randomInt(speciaux.length)];

  // Compléter le reste
  for (let i = motDePasse.length; i < longueur; i++) {
    motDePasse += tous[crypto.randomInt(tous.length)];
  }

  // Mélanger
  return motDePasse.split('').sort(() => crypto.randomInt(2) - 0.5).join('');
};