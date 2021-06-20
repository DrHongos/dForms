import {useHistory} from 'react-router-dom';
import {IconButton} from '@chakra-ui/react';
import {TriangleUpIcon} from '@chakra-ui/icons';
function GoBack(props) {
  const history = useHistory();

  return (
      <IconButton
        icon={<TriangleUpIcon />}
        onClick={()=>history.push(props.path)}></IconButton>
      )
}

export default GoBack;
