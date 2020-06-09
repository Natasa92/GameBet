import React, { useState } from 'react';
import { Form, Input, Button } from 'semantic-ui-react';
import { Styles } from '../config';

const CreateBetPage = () => {
  const [data, setData] = useState({
    homeTeam: '',
    awayTeam: '',
    startTime: '',
    stake: '',
  });

  const handleChange = (e, { id, value }) => { setData({ ...data, [id]: value })};

  const handleOnSubmit = () => { };

  return (
    <Form style={Styles.CREATE_FORM} onSubmit={handleOnSubmit}>
      <Form.Field
        id="homeTeam"
        control={Input}
        label="Home team"
        placeholder="Home team"
        onChange={handleChange}
      />
      <Form.Field
        id="awayTeam"
        control={Input}
        label="Away team"
        placeholder="Away team"
        onChange={handleChange}
      />
      <Form.Field
        id="startTime"
        control={Input}
        label="Start time"
        placeholder="Start time"
        onChange={handleChange}
      />
      <Form.Field
        id="stake"
        control={Input}
        label="Stake"
        placeholder="Stake"
        onChange={handleChange}
      />
      <Button style={{ marginLeft: "auto" }} primary type="submit">Create Bet</Button>
    </Form>
  );
}

export default CreateBetPage;