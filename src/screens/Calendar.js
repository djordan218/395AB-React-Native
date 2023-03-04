import React, { useState, Fragment } from 'react';
import { StyleSheet, View, ScrollView, Text, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';

// need format of 2022-07-06
const INITIAL_DATE = formatDate(new Date());

function formatDate(date) {
  let d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}
const testIDs = {
  menu: {
    CONTAINER: 'menu',
    CALENDARS: 'calendars_btn',
    CALENDAR_LIST: 'calendar_list_btn',
    HORIZONTAL_LIST: 'horizontal_list_btn',
    AGENDA: 'agenda_btn',
    EXPANDABLE_CALENDAR: 'expandable_calendar_btn',
    WEEK_CALENDAR: 'week_calendar_btn',
    TIMELINE_CALENDAR: 'timeline_calendar_btn',
    PLAYGROUND: 'playground_btn',
  },
  calendars: {
    CONTAINER: 'calendars',
    FIRST: 'first_calendar',
    LAST: 'last_calendar',
  },
  calendarList: { CONTAINER: 'calendarList' },
  horizontalList: { CONTAINER: 'horizontalList' },
  agenda: {
    CONTAINER: 'agenda',
    ITEM: 'item',
  },
  expandableCalendar: { CONTAINER: 'expandableCalendar' },
  weekCalendar: { CONTAINER: 'weekCalendar' },
};

const markedDates = {
  [INITIAL_DATE]: {
    selected: true,
    marked: true,
    dotColor: 'black',
    selectedColor: '#f8d360',
    selectedTextColor: 'black',
    details: 'here are some details',
  },
  '2023-02-27': {
    selected: true,
    marked: true,
    dotColor: 'black',
    selectedColor: '#f8d360',
    selectedTextColor: 'black',
    details: 'details',
  },
  '2023-03-01': {
    selected: true,
    marked: true,
    dotColor: 'black',
    selectedColor: '#f8d360',
    selectedTextColor: 'black',
    details: 'here are some more details',
  },
  '2023-03-10': {
    selected: true,
    marked: true,
    dotColor: 'black',
    selectedColor: '#f8d360',
    selectedTextColor: 'black',
    details:
      'here are some additional details that you should probably know about but I do not want to tell you because it is so long',
  },
};

const CalendarScreen = () => {
  const renderCalendarWithPeriodMarkingAndDotMarking = () => {
    const [details, setDetails] = useState('');
    return (
      <Fragment>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <Image
            style={styles.imageSmall}
            source={require('../../assets/63rd.png')}
          />
          <Text style={styles.text}>
            395th Battle Assembly Dates & Missions
          </Text>
        </View>
        <Calendar
          current={INITIAL_DATE}
          markingType={'dot'}
          markedDates={markedDates}
          onDayPress={(day) => {
            if (markedDates[day.dateString] === undefined) {
              setDetails('');
            } else {
              setDetails(markedDates[day.dateString]['details']);
            }
          }}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
          }}
        >
          <Text style={styles.bottomText}>{details}</Text>
        </View>
      </Fragment>
    );
  };

  const renderExamples = () => {
    return (
      <Fragment>{renderCalendarWithPeriodMarkingAndDotMarking()}</Fragment>
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      testID={testIDs.calendars.CONTAINER}
    >
      {renderExamples()}
    </ScrollView>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  calendar: {
    marginBottom: 10,
  },
  text: {
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#d90532',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    width: '100%',
  },
  bottomText: {
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#fff',
    color: 'black',
    fontSize: 16,
    padding: 20,
  },
  customTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  imageSmall: {
    resizeMode: 'contain',
    height: 100,
    width: 100,
    marginBottom: 10,
  },
});
