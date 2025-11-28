import { FC } from 'react';
import { Image, Typography, VerticalStack } from 'mn-toolkit';
import { ICodexYgoCardEntity, TCodexYgoCardLanguage } from './interfaces';

interface ICodexYgoCardDisplayProps {
  /** The language to display */
  language: TCodexYgoCardLanguage;
  /** The card entity to display */
  card: ICodexYgoCardEntity;
  /** Image URL of the card */
  imageUrl?: string;
}

/**
 * Display a single CodexYgo card with its image and name
 */
export const CodexYgoCardDisplay: FC<ICodexYgoCardDisplayProps> = ({ language, card, imageUrl }) => {
  const cardName = card.translations[language]?.name || '???';

  return (
    <VerticalStack className='codexygo-card-display' gutter='small' itemAlignment='center'>
      <Image fill src={imageUrl} alt={cardName} />
      <Typography noWrap bold variant='label' contentType='text' content={cardName} />
    </VerticalStack>
  );
};
