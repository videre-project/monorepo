import { styled } from '../stitches.config.ts';

export const Button = styled('button', {
  borderRadius: '$round',
  fontSize: '$4',
  padding: '$2 $3',
  border: '2px solid $turq',
  color: '$white',

  '&:hover': {
    backgroundColor: '$turq',
    color: '$black',
  },
});
