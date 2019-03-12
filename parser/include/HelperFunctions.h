/*
  Peter Hudel
  1012673
  CIS*2750
*/

#ifndef HELPERFUNCTIONS_H
#define HELPERFUNCTIONS_H

#include <stdbool.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

#include "LinkedListAPI.h"
#include "CalendarParser.h"

//Helper function to tell what the current item you are reading in is (alarm, event, ical property)
void updateState(int *event, int *alarm, char *first, char *ptr, Event **evt, Calendar **cal, Alarm **alm, ICalErrorCode *error);

//Helper function to create a new DateTime struct
void createDate(char *ptr, DateTime **dt);

//Helper function to add a new event
void addToEvent(char *first, char *ptr, Calendar **obj, Event **evt, ICalErrorCode *err);

//Helper function to add a property to an alarm
void addToAlarm(char *first, char *ptr, Event **evt, Alarm **alm);

//Helper function to add a property to the iCal file
void addToCal(char *first, char *ptr, Calendar **obj, ICalErrorCode *err, int *isVersion);

char* serializeEvent(void* toBePrinted, FILE **fp);

char* serializeAlarm(void* toBePrinted);

ICalErrorCode validateEvent(void *toBeValidated);

ICalErrorCode validateAlarm(void *toBeValidated);

ICalErrorCode validateDateTime(char *date);

ICalErrorCode validateDateTimeStruct(DateTime dt);

int validateProperty(Property *prop);

ICalErrorCode isInt(char *word, ICalErrorCode err);

#endif
