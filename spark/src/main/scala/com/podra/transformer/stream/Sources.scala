package com.podra.transformer.stream

import org.apache.flink.connector.kafka.source.KafkaSource
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer
import org.apache.flink.api.common.serialization.SimpleStringSchema
import org.apache.flink.connector.kafka.sink.KafkaSink
import org.apache.flink.connector.kafka.sink.KafkaRecordSerializationSchema
import org.apache.flink.connector.base.DeliveryGuarantee

object KafkaStream {
    val Brokers: String = ""
    val Topics: String = ""
    val GroupId: String = ""
    def getSource: KafkaSource[String] = {
        KafkaSource.builder[String]()
            .setBootstrapServers(Brokers)
            .setTopics(Topics)
            .setGroupId(GroupId)
            .setStartingOffsets(OffsetsInitializer.earliest())
            .setValueOnlyDeserializer(new SimpleStringSchema)
            .build()
    }

    def getSink: KafkaSink[String] = {
        KafkaSink.builder[String]()
            .setBootstrapServers(Brokers)
            .setRecordSerializer(
                KafkaRecordSerializationSchema.builder()
                    .setTopic(Topics)
                    .setValueSerializationSchema(new SimpleStringSchema)
                    .build()
            )
            .setDeliverGuarantee(DeliveryGuarantee.AT_LEAST_ONCE)
            .build()
    }
}