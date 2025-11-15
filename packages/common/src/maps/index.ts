import { TMX } from '../tiled';
import gigantic from './gigantic.json';
import small from './small.json';
import desert from './desert.json';
import ice from './ice.json';
import forest from './forest.json';

export const List: { [key: string]: TMX.IMap } = {
    small,
    gigantic,
    desert,
    ice,
    forest,
};
