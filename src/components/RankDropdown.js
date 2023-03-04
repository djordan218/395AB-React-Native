import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { StyleSheet } from 'react-native';

export default function RankDropdown({ ...props }) {
  const [rankOpen, setRankOpen] = useState(false);
  const [rankValue, setRankValue] = useState(null);
  const [rank, setRank] = useState([
    { label: 'RANK', value: '' },
    { label: 'PFC', value: 'pfc' },
    { label: 'SPC', value: 'spc' },
    { label: 'SGT', value: 'sgt' },
    { label: 'SSG', value: 'ssg' },
    { label: 'SFC', value: 'sfc' },
    { label: 'MSG', value: 'msg' },
    { label: '1SG', value: '1sg' },
    { label: 'CMD', value: 'cmd' },
  ]);
  return (
    <DropDownPicker
      open={rankOpen}
      value={rankValue}
      items={rank}
      setOpen={setRankOpen}
      setValue={setRankValue}
      setItems={setRank}
      style={styles.dropdown}
      showTickIcon={false}
      textStyle={{
        fontSize: 15,
        textAlign: 'center',
      }}
      placeholder="RANK"
      placeholderStyle={{
        fontSize: 14,
        textAlign: 'center',
        marginLeft: 30,
      }}
      labelStyle={{
        marginLeft: 30,
      }}
      arrowIconStyle={{
        width: 20,
        height: 20,
      }}
      dropDownContainerStyle={{
        width: '90%',
        borderWidth: 2,
      }}
    />
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    width: '90%',
    marginBottom: 10,
  },
});
